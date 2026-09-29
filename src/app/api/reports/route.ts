import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createReportSchema } from "@/lib/validations/report";
import { createAuditLog } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitize } from "@/lib/sanitize";
import { encrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const status = searchParams.get("status");
  const skip = (page - 1) * limit;

  let where: Record<string, unknown> = {};

  if (session.user.role === "RESEARCHER") {
    where = { researcherId: session.user.id };
  } else if (session.user.role === "COMPANY") {
    const company = await db.company.findUnique({
      where: { userId: session.user.id },
      include: { programs: { select: { id: true } } },
    });
    if (!company) {
      return NextResponse.json({ reports: [], total: 0, page: 1, totalPages: 0 });
    }
    where = { programId: { in: company.programs.map((p) => p.id) } };
  }

  if (status) {
    where.status = status;
  }

  const [reports, total] = await Promise.all([
    db.report.findMany({
      where,
      include: {
        researcher: { select: { id: true, name: true, image: true } },
        program: { select: { id: true, title: true, company: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.report.count({ where }),
  ]);

  return NextResponse.json({ reports, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "RESEARCHER") {
    return NextResponse.json({ error: "Only researchers can submit reports" }, { status: 403 });
  }

  const rl = await checkRateLimit(session.user.id, "report");
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const body = await req.json();
  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { programId, title, description, stepsToReproduce, vulnType, severity, cvssScore } =
    parsed.data;

  const program = await db.program.findUnique({
    where: { id: programId },
    include: { company: { select: { userId: true, name: true } } },
  });

  if (!program || program.status !== "ACTIVE") {
    return NextResponse.json({ error: "Program not found or not active" }, { status: 404 });
  }

  const report = await db.$transaction(async (tx) => {
    const rep = await tx.report.create({
      data: {
        researcherId: session.user.id,
        programId,
        title: sanitize(title),
        description: encrypt(sanitize(description)),
        stepsToReproduce: encrypt(sanitize(stepsToReproduce)),
        vulnType: sanitize(vulnType),
        severity: sanitize(severity),
        cvssScore,
        isEncrypted: true,
      },
    });

    await tx.timeline.create({
      data: {
        reportId: rep.id,
        userId: session.user.id,
        action: "Report submitted",
        newStatus: "NEW",
      },
    });

    await tx.notification.create({
      data: {
        userId: program.company.userId,
        type: "REPORT_SUBMITTED",
        title: "New Report Submitted",
        message: `A new vulnerability report "${sanitize(title)}" has been submitted to ${program.title}`,
        link: `/reports/${rep.id}`,
      },
    });

    return rep;
  });

  await createAuditLog({
    userId: session.user.id,
    action: "REPORT_CREATE",
    entity: "Report",
    entityId: report.id,
  });

  return NextResponse.json({ report: { id: report.id } }, { status: 201 });
}
