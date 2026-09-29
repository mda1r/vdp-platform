import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function GET(
  _req: NextRequest,
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
      researcher: {
        select: { id: true, name: true, image: true, email: true },
      },
      program: {
        select: {
          id: true,
          title: true,
          companyId: true,
          company: { select: { userId: true, name: true } },
        },
      },
      attachments: true,
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      timelines: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
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

  let description = report.description;
  let stepsToReproduce = report.stepsToReproduce;

  if (report.isEncrypted) {
    try {
      description = decrypt(report.description);
      stepsToReproduce = decrypt(report.stepsToReproduce);
    } catch {
      description = "[Decryption failed]";
      stepsToReproduce = "[Decryption failed]";
    }
  }

  const filteredComments = isCompanyOwner || isAdmin
    ? report.comments
    : report.comments.filter((c) => !c.isInternal);

  return NextResponse.json({
    report: {
      ...report,
      description,
      stepsToReproduce,
      comments: filteredComments,
    },
  });
}
