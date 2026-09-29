import { requireAnyRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Building2,
  Bug,
  Clock,
  Plus,
  Eye,
  Terminal,
  FolderOpen,
  Activity,
  ChevronRight,
  ShieldAlert,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, { color: string; dot: string; bg: string }> = {
  NEW: { color: "text-sky-400", dot: "bg-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
  TRIAGED: { color: "text-yellow-400", dot: "bg-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  ACCEPTED: { color: "text-emerald-400", dot: "bg-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  RESOLVED: { color: "text-emerald-400", dot: "bg-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  CLOSED: { color: "text-zinc-400", dot: "bg-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
  DUPLICATE: { color: "text-orange-400", dot: "bg-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  INFORMATIVE: { color: "text-violet-400", dot: "bg-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  OUT_OF_SCOPE: { color: "text-red-400", dot: "bg-red-400", bg: "bg-red-500/10 border-red-500/20" },
  NOT_APPLICABLE: { color: "text-red-400", dot: "bg-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const PROGRAM_STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  ACTIVE: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  PAUSED: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  CLOSED: { color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
  DRAFT: { color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
};

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${className ?? "border-zinc-700 text-zinc-500"}`}
    >
      {children}
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
        <Icon className="h-4 w-4 text-emerald-500" />
      </div>
      <div className="flex items-center gap-2">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-zinc-300">
          {title}
        </h2>
        {count !== undefined && (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-400">
            {count}
          </span>
        )}
      </div>
      {subtitle && (
        <span className="font-mono text-xs text-zinc-600">{subtitle}</span>
      )}
    </div>
  );
}

export default async function CompanyDashboardPage() {
  const session = await requireAnyRole("COMPANY", "ADMIN");

  const company = await db.company.findUnique({
    where: { userId: session.user.id },
    include: {
      programs: {
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { programs: true } },
    },
  });

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="font-mono text-xl font-bold text-zinc-100">
            Company Profile Not Found
          </h1>
          <p className="mt-2 font-mono text-sm text-zinc-500">
            $ whoami # error: no company profile linked to this account
          </p>
        </div>
      </div>
    );
  }

  const programIds = company.programs.map((p) => p.id);

  const totalReports = await db.report.count({
    where: { programId: { in: programIds } },
  });

  const newReports = await db.report.count({
    where: {
      programId: { in: programIds },
      status: "NEW",
    },
  });

  const recentReports = await db.report.findMany({
    where: { programId: { in: programIds } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      program: { select: { title: true } },
    },
  });

  const isVerified = company.isVerified;

  const stats = [
    {
      label: "PROGRAMS",
      sublabel: "> active scopes",
      value: company._count.programs,
      icon: Eye,
      accent: false,
      amberWarn: false,
    },
    {
      label: "TOTAL REPORTS",
      sublabel: "> received submissions",
      value: totalReports,
      icon: Bug,
      accent: false,
      amberWarn: false,
    },
    {
      label: "PENDING REVIEW",
      sublabel: "> awaiting triage",
      value: newReports,
      icon: Clock,
      accent: false,
      amberWarn: newReports > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Company header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
                  {company.name}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <ShieldAlert className="h-3 w-3" />
                    Pending
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Company dashboard
              </p>
            </div>
          </div>

          <Link href="/programs/new">
            <Button
              variant="outline"
              className="gap-2 border-emerald-500/30 font-mono text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              <Plus className="h-4 w-4" />
              New Program
            </Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`group rounded-lg border transition-colors ${
                  stat.amberWarn
                    ? "border-amber-500/30 bg-amber-950/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      {stat.label}
                    </span>
                    <Icon
                      className={`h-4 w-4 transition-colors duration-300 ${
                        stat.amberWarn
                          ? "text-amber-400"
                          : "text-zinc-600 group-hover:text-emerald-500"
                      }`}
                    />
                  </div>
                  <div
                    className={`font-mono text-3xl font-bold tracking-tight ${
                      stat.amberWarn ? "text-amber-400" : "text-zinc-100"
                    }`}
                  >
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">
                    {stat.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Programs section */}
        <div className="mb-8 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
          <div className="border-b border-zinc-800/60 px-5 py-4">
            <SectionHeader
              icon={FolderOpen}
              title="Programs"
              count={company.programs.length}
            />
          </div>

          {company.programs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="mb-4 h-10 w-10 text-zinc-700" />
              <p className="font-mono text-sm text-zinc-600">
                $ ls ./programs # empty
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-700">
                # create your first bug bounty program to start receiving reports
              </p>
              <Link href="/programs/new">
                <Button
                  variant="outline"
                  className="mt-4 gap-2 border-emerald-500/30 font-mono text-xs text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Plus className="h-3 w-3" />
                  Create Program
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {company.programs.map((program) => {
                const statusStyle =
                  PROGRAM_STATUS_STYLES[program.status] ??
                  PROGRAM_STATUS_STYLES.DRAFT;
                return (
                  <Link
                    key={program.id}
                    href={`/programs/${program.id}`}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-emerald-500/5"
                  >
                    <FolderOpen className="h-4 w-4 flex-shrink-0 text-zinc-600 group-hover:text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm font-medium text-zinc-200 group-hover:text-emerald-300">
                        {program.title}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-zinc-600">
                        Created {format(program.createdAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    <Tag className={`border ${statusStyle.bg} ${statusStyle.color}`}>
                      {program.status}
                    </Tag>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-700 transition-colors group-hover:text-emerald-500" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Reports section */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30">
          <div className="border-b border-zinc-800/60 px-5 py-4">
            <SectionHeader
              icon={Activity}
              title="Recent Reports"
              count={recentReports.length}
            />
          </div>

          {recentReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Bug className="mb-4 h-10 w-10 text-zinc-700" />
              <p className="font-mono text-sm text-zinc-600">
                $ tail -f ./reports.log
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-700">
                # waiting for incoming vulnerability reports...
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {recentReports.map((report) => {
                const statusStyle =
                  STATUS_STYLES[report.status] ?? STATUS_STYLES.NEW;
                return (
                  <Link
                    key={report.id}
                    href={`/reports/${report.id}`}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-emerald-500/5"
                  >
                    {/* Status dot */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                      />
                      {report.status === "NEW" && (
                        <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-amber-400/60" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-mono text-sm font-medium text-zinc-200 group-hover:text-emerald-300">
                          {report.title}
                        </p>
                        {report.vulnerabilityType && (
                          <Tag className="border-zinc-700/50 text-zinc-500">
                            {report.vulnerabilityType}
                          </Tag>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3">
                        <span className="font-mono text-xs text-zinc-600">
                          {report.program.title}
                        </span>
                        <span className="text-zinc-800">&middot;</span>
                        <span className="font-mono text-xs text-zinc-600">
                          {format(report.createdAt, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <Tag className={`border ${statusStyle.bg} ${statusStyle.color}`}>
                      {report.status}
                    </Tag>

                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-700 transition-colors group-hover:text-emerald-500" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
