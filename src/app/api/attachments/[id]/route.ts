import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attachmentId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attachment = await db.attachment.findUnique({
    where: { id: attachmentId },
    include: {
      report: {
        select: {
          researcherId: true,
          program: { select: { company: { select: { userId: true } } } },
        },
      },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isResearcher = attachment.report.researcherId === session.user.id;
  const isCompanyOwner =
    attachment.report.program.company.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isResearcher && !isCompanyOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filePath = join(UPLOAD_DIR, attachment.reportId, attachment.storedName);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(filePath);
  } catch {
    return NextResponse.json(
      { error: "File not found on disk" },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.filename)}"`,
      "Content-Length": String(fileBuffer.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attachmentId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attachment = await db.attachment.findUnique({
    where: { id: attachmentId },
    include: {
      report: {
        select: {
          researcherId: true,
          program: { select: { company: { select: { userId: true } } } },
        },
      },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isResearcher = attachment.report.researcherId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isResearcher && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { unlink } = await import("fs/promises");
  const filePath = join(UPLOAD_DIR, attachment.reportId, attachment.storedName);

  try {
    await unlink(filePath);
  } catch {
    // file may have been removed already
  }

  await db.attachment.delete({ where: { id: attachmentId } });

  const { createAuditLog } = await import("@/lib/audit");
  await createAuditLog({
    userId: session.user.id!,
    action: "ATTACHMENT_DELETE",
    entity: "attachment",
    entityId: attachmentId,
    metadata: {
      reportId: attachment.reportId,
      filename: attachment.filename,
    },
  });

  return NextResponse.json({ success: true });
}
