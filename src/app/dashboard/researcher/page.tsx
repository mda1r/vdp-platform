import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { StatusBadge, PriorityBadge } from "@/components/reports/status-badge";
import {
  Shield,
  Bug,
  Trophy,
  Clock,
  Terminal,
  ChevronRight,
  Plus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getRank } from "@/lib/ranks";

function countOf(
  stats: { status: string; _count: { _all: number } }[],
  ...statuses: string[]
) {
  return stats
    .filter((s) => statuses.includes(s.status))
    .reduce((sum, s) => sum + s._count._all, 0);
}

export default async function ResearcherDashboardPage() {
  const session = await requireAuth("RESEARCHER");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { points: true, name: true },
  });

  const reportStats = await db.report.groupBy({
    by: ["status"],
    _count: { _all: true },
    where: { researcherId: session.user.id },
  });

  const recentReports = await db.report.findMany({
    where: { researcherId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      program: { select: { title: true } },
    },
  });

  const totalReports = reportStats.reduce((s, r) => s + r._count._all, 0);
  const acceptedReports = countOf(reportStats, "ACCEPTED", "RESOLVED");
  const pendingReports = countOf(reportStats, "NEW", "TRIAGED");
  const points = user?.points ?? 0;
  const rank = getRank(points);

  const stats = [
    {
      label: "TOTAL REPORTS",
      value: totalReports,
      icon: Bug,
      accent: false,
    },
    {
      label: "ACCEPTED",
      value: acceptedReports,
      icon: Shield,
      accent: false,
    },
    {
      label: "PENDING REVIEW",
      value: pendingReports,
      icon: Clock,
      accent: false,
    },
    {
      label: "POINTS",
      value: points,
      icon: Trophy,
      accent: true,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome header + New Report button */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Welcome back, {user?.name ?? "Researcher"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Your research dashboard
            </p>
          </div>

          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-mono text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            New Report
          </Link>
        </div>

        {/* Stat cards grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`group rounded-lg border transition-colors ${
                  stat.accent
                    ? "border-emerald-500/30 bg-emerald-950/20"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      {stat.label}
                    </span>
                    <Icon
                      className={`h-4 w-4 ${
                        stat.accent ? "text-emerald-400" : "text-zinc-600"
                      }`}
                    />
                  </div>
                  <div
                    className={`font-mono text-3xl font-bold tracking-tight ${
                      stat.accent ? "text-emerald-400" : "text-zinc-100"
                    }`}
                  >
                    {stat.value.toLocaleString()}
                  </div>

                  {/* Security Clearance rank on the points card */}
                  {stat.accent && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-emerald-500" />
                      <span
                        className={`font-mono text-[10px] font-bold uppercase tracking-widest ${rank.color}`}
                      >
                        {rank.tag}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Reports section */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30">
          <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-emerald-500">
                {">"}{" "}
              </span>
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-zinc-300">
                Recent Reports
              </h2>
            </div>
            <Link
              href="/reports"
              className="font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400"
            >
              view all &rarr;
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Bug className="mb-4 h-10 w-10 text-zinc-700" />
              <p className="font-mono text-sm text-zinc-600">
                $ ls ./reports
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-700">
                # no reports found — submit your first vulnerability
              </p>
              <Link
                href="/reports/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 px-4 py-2 font-mono text-xs text-emerald-400 transition-colors hover:bg-emerald-500/10"
              >
                <Plus className="h-3 w-3" />
                Create Report
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-emerald-500/5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="truncate font-mono text-sm font-medium text-zinc-200 group-hover:text-emerald-300">
                        {report.title}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="font-mono text-xs text-zinc-600">
                        {report.program.title}
                      </span>
                      <span className="text-zinc-800">&middot;</span>
                      <span className="font-mono text-xs text-zinc-600">
                        {format(report.createdAt, "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={report.priority} />
                    <StatusBadge
                      status={report.status}
                      canSeeInternal={false}
                    />
                  </div>

                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-700 transition-colors group-hover:text-emerald-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
