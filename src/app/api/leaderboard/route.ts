import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));

  const researchers = await db.user.findMany({
    where: {
      role: "RESEARCHER",
      isActive: true,
      isBanned: false,
    },
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
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
    orderBy: { points: "desc" },
    take: limit,
  });

  return NextResponse.json({ researchers });
}
