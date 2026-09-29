import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations/report";
import { createAuditLog } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitize } from "@/lib/sanitize";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(session.user.id, "comment");
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

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

  const isResearcher = report.researcherId === session.user.id;
  const isCompanyOwner = report.program.company.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isResearcher && !isCompanyOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.isInternal && isResearcher) {
    return NextResponse.json(
      { error: "Researchers cannot post internal comments" },
      { status: 403 }
    );
  }

  const comment = await db.$transaction(async (tx) => {
    const c = await tx.comment.create({
      data: {
        reportId: id,
        userId: session.user.id,
        content: sanitize(parsed.data.content),
        isInternal: parsed.data.isInternal,
      },
      include: {
        user: { select: { id: true, name: true, image: true, role: true } },
      },
    });

    const notifyUserId = isResearcher
      ? report.program.company.userId
      : report.researcherId;

    if (!parsed.data.isInternal) {
      await tx.notification.create({
        data: {
          userId: notifyUserId,
          type: "NEW_COMMENT",
          title: "New Comment",
          message: `New comment on report: ${report.title}`,
          link: `/reports/${id}`,
        },
      });
    }

    await tx.timeline.create({
      data: {
        reportId: id,
        userId: session.user.id,
        action: parsed.data.isInternal ? "Internal note added" : "Comment added",
      },
    });

    return c;
  });

  await createAuditLog({
    userId: session.user.id,
    action: "COMMENT_CREATE",
    entity: "Comment",
    entityId: comment.id,
  });

  return NextResponse.json({ comment }, { status: 201 });
}
