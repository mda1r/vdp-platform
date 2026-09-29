import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProgramSchema } from "@/lib/validations/program";
import { createAuditLog } from "@/lib/audit";
import { sanitize } from "@/lib/sanitize";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const program = await db.program.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true, logo: true, website: true, description: true, isVerified: true } },
      scopes: { orderBy: { inScope: "desc" } },
      rules: { orderBy: { sortOrder: "asc" } },
      rewards: { orderBy: { priority: "asc" } },
      _count: { select: { reports: true } },
    },
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json({ program });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const program = await db.program.findUnique({
    where: { id },
    include: { company: { select: { userId: true } } },
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  if (
    program.company.userId !== session.user.id &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateProgramSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, description, status, scopes, rules, rewards } = parsed.data;

  const updated = await db.$transaction(async (tx) => {
    const prog = await tx.program.update({
      where: { id },
      data: {
        ...(title && { title: sanitize(title) }),
        ...(description && { description: sanitize(description) }),
        ...(status && { status }),
      },
    });

    if (scopes) {
      await tx.programScope.deleteMany({ where: { programId: id } });
      await tx.programScope.createMany({
        data: scopes.map((s) => ({
          programId: id,
          target: sanitize(s.target),
          type: s.type,
          inScope: s.inScope,
          notes: s.notes ? sanitize(s.notes) : null,
        })),
      });
    }

    if (rules) {
      await tx.programRule.deleteMany({ where: { programId: id } });
      await tx.programRule.createMany({
        data: rules.map((r, i) => ({
          programId: id,
          title: sanitize(r.title),
          content: sanitize(r.content),
          sortOrder: i,
        })),
      });
    }

    if (rewards) {
      await tx.programReward.deleteMany({ where: { programId: id } });
      await tx.programReward.createMany({
        data: rewards.map((r) => ({
          programId: id,
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
    action: "PROGRAM_UPDATE",
    entity: "Program",
    entityId: id,
  });

  return NextResponse.json({ program: updated });
}
