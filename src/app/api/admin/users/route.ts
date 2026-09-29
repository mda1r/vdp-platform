import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { sanitize } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 20;
  const role = searchParams.get("role");
  const skip = (page - 1) * limit;

  const where = role ? { role: role as "RESEARCHER" | "COMPANY" | "ADMIN" } : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isBanned: true,
        points: true,
        createdAt: true,
        company: { select: { name: true, isVerified: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role, companyName } = body as {
    name: string;
    email: string;
    password: string;
    role: "RESEARCHER" | "COMPANY" | "ADMIN";
    companyName?: string;
  };

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["RESEARCHER", "COMPANY", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (role === "COMPANY" && !companyName) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name: sanitize(name),
      email,
      hashedPassword,
      role,
    },
  });

  if (role === "COMPANY" && companyName) {
    await db.company.create({
      data: {
        userId: user.id,
        name: sanitize(companyName),
        isVerified: true,
      },
    });
  }

  await createAuditLog({
    userId: session.user.id,
    action: "ADMIN_CREATE_USER",
    entity: "User",
    entityId: user.id,
    metadata: { role, email },
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, action } = body as { userId: string; action: string };

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
  }

  switch (action) {
    case "ban":
      await db.user.update({ where: { id: userId }, data: { isBanned: true } });
      break;
    case "unban":
      await db.user.update({ where: { id: userId }, data: { isBanned: false } });
      break;
    case "verify_company":
      await db.company.updateMany({ where: { userId }, data: { isVerified: true } });
      break;
    case "make_admin":
      await db.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await createAuditLog({
    userId: session.user.id,
    action: "ADMIN_ACTION",
    entity: "User",
    entityId: userId,
    metadata: { action },
  });

  return NextResponse.json({ success: true });
}
