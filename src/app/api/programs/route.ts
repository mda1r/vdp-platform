import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProgramSchema } from "@/lib/validations/program";
import { createAuditLog } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitize } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "12")));
  const skip = (page - 1) * limit;

  const [programs, total] = await Promise.all([
    db.program.findMany({
      where: { status: "ACTIVE" },
      include: {
        company: { select: { name: true, logo: true, isVerified: true } },
        scopes: { where: { inScope: true }, take: 5 },
        rewards: true,
        _count: { select: { reports: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.program.count({ where: { status: "ACTIVE" } }),
  ]);

  return NextResponse.json({ programs, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rl = await checkRateLimit(session.user.id, "api");
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const body = await req.json();
  const parsed = createProgramSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const company = await db.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) {
    return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
  }

  const { title, description, scopes, rules, rewards } = parsed.data;

  const program = await db.$transaction(async (tx) => {
    const prog = await tx.program.create({
      data: {
        companyId: company.id,
        title: sanitize(title),
        description: sanitize(description),
      },
    });

    await tx.programScope.createMany({
      data: scopes.map((s) => ({
        programId: prog.id,
        target: sanitize(s.target),
        type: s.type,
        inScope: s.inScope,
        notes: s.notes ? sanitize(s.notes) : null,
      })),
    });

    if (rules?.length) {
      await tx.programRule.createMany({
        data: rules.map((r, i) => ({
          programId: prog.id,
          title: sanitize(r.title),
          content: sanitize(r.content),
          sortOrder: i,
        })),
      });
    }

    if (rewards?.length) {
      await tx.programReward.createMany({
        data: rewards.map((r) => ({
          programId: prog.id,
          priority: r.priority,
          minAmount: r.minAmount,
          maxAmount: r.maxAmount,
          currency: r.currency,
        })),
      });
    }

    return prog;
  });

  await createAuditLog({
    userId: session.user.id,
    action: "PROGRAM_CREATE",
    entity: "Program",
    entityId: program.id,
  });

  return NextResponse.json({ program }, { status: 201 });
}
