import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    totalResearchers,
    totalCompanies,
    totalPrograms,
    totalReports,
    pendingCompanies,
    reportsByStatus,
    reportsByPriority,
    recentReports,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "RESEARCHER" } }),
    db.company.count(),
    db.program.count(),
    db.report.count(),
    db.company.count({ where: { isVerified: false } }),
    db.report.groupBy({ by: ["status"], _count: true }),
    db.report.groupBy({ by: ["priority"], _count: true, where: { priority: { not: null } } }),
    db.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        researcher: { select: { name: true } },
        program: { select: { title: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalResearchers,
    totalCompanies,
    totalPrograms,
    totalReports,
    pendingCompanies,
    reportsByStatus,
    reportsByPriority,
    recentReports,
  });
}
