import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/html",
  "application/json",
  "video/mp4",
  "video/webm",
  "application/zip",
  "application/x-tar",
  "application/gzip",
]);

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE ?? "10485760", 10);
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed, resetAt } = await checkRateLimit(
    session.user.id!,
    "upload"
  );
  if (!allowed) return rateLimitResponse(resetAt);

  const report = await db.report.findUnique({
    where: { id: reportId },
    select: {
      researcherId: true,
      program: { select: { company: { select: { userId: true } } } },
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

  const existingCount = await db.attachment.count({ where: { reportId } });
  if (existingCount >= 10) {
    return NextResponse.json(
      { error: "Maximum 10 attachments per report" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeExt = ext.replace(/[^a-z0-9]/g, "").slice(0, 10);
  const storedName = `${randomUUID()}.${safeExt}`;

  const uploadPath = join(UPLOAD_DIR, reportId);
  await mkdir(uploadPath, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadPath, storedName), buffer);

  const sanitizedFilename = file.name
    .replace(/[^\w.\-() ]/g, "_")
    .slice(0, 255);

  const attachment = await db.attachment.create({
    data: {
      reportId,
      filename: sanitizedFilename,
      storedName,
      mimeType: file.type,
      size: file.size,
      url: `/api/attachments/${reportId}/${storedName}`,
    },
  });

  await createAuditLog({
    userId: session.user.id!,
    action: "ATTACHMENT_UPLOAD",
    entity: "attachment",
    entityId: attachment.id,
    metadata: { reportId, filename: sanitizedFilename, size: file.size },
  });

  return NextResponse.json({ attachment }, { status: 201 });
}
