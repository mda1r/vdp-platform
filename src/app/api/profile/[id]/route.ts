import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      skills: true,
      website: true,
      github: true,
      twitter: true,
      points: true,
      role: true,
      createdAt: true,
      badges: {
        include: { badge: true },
        orderBy: { awardedAt: "desc" },
      },
      _count: {
        select: {
          reports: {
            where: { status: { in: ["ACCEPTED", "RESOLVED", "CLOSED"] } },
          },
        },
      },
    },
  });

  if (!user || user.role !== "RESEARCHER") {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
