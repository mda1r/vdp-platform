import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { sanitize } from "@/lib/sanitize";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  github: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.name && { name: sanitize(data.name) }),
      ...(data.bio !== undefined && { bio: sanitize(data.bio) }),
      ...(data.skills && { skills: data.skills.map(sanitize) }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.github !== undefined && { github: sanitize(data.github) }),
      ...(data.twitter !== undefined && { twitter: sanitize(data.twitter) }),
    },
    select: {
      id: true,
      name: true,
      bio: true,
      skills: true,
      website: true,
      github: true,
      twitter: true,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "USER_UPDATE",
    entity: "User",
    entityId: session.user.id,
  });

  return NextResponse.json({ user });
}
