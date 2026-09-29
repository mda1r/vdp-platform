import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateReportStatusSchema } from "@/lib/validations/report";
import { createAuditLog } from "@/lib/audit";
import { awardPoints, checkAndAwardBadges, getPenaltyForStatus, deductPoints } from "@/lib/points";
import { Priority } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await db.report.findUnique({
    where: { id },
    include: {
      program: {
        select: { company: { select: { userId: true } } },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const isCompanyOwner = report.program.company.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isCompanyOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateReportStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status, priority } = parsed.data;
  const oldStatus = report.status;

  const updated = await db.$transaction(async (tx) => {
    const rep = await tx.report.update({
      where: { id },
      data: {
        status,
        ...(priority && { priority }),
      },
    });

    await tx.timeline.create({
      data: {
        reportId: id,
        userId: session.user.id,
        action: `Status changed from ${oldStatus} to ${status}`,
        oldStatus,
        newStatus: status,
      },
    });

    const displayStatus = status === "RESOLVED" ? "ACCEPTED" : status;
    await tx.notification.create({
      data: {
        userId: report.researcherId,
        type: "REPORT_STATUS_CHANGED",
        title: "Report Status Updated",
        message: `Your report has been updated to: ${displayStatus.replace(/_/g, " ")}`,
        link: `/reports/${id}`,
      },
    });

    const effectivePriority = priority ?? report.priority;
    if (
      (status === "ACCEPTED" || status === "RESOLVED") &&
      effectivePriority &&
      oldStatus !== "ACCEPTED" &&
      oldStatus !== "RESOLVED"
    ) {
      await awardPoints(report.researcherId, effectivePriority as Priority);
      await checkAndAwardBadges(report.researcherId);
    }

    const penalty = getPenaltyForStatus(status);
    if (penalty < 0 && oldStatus !== "SPAM" && oldStatus !== "OUT_OF_SCOPE") {
      await deductPoints(report.researcherId, penalty);
    }

    return rep;
  });

  await createAuditLog({
    userId: session.user.id,
    action: "REPORT_STATUS_CHANGE",
    entity: "Report",
    entityId: id,
    metadata: { oldStatus, newStatus: status, priority },
  });

  return NextResponse.json({ report: updated });
}
