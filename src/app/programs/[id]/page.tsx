export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  BadgeCheck,
  ExternalLink,
  AlertTriangle,
  Trophy,
  Crosshair,
  ScrollText,
  Activity,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRIORITY_LABELS: Record<string, string> = {
  P1_CRITICAL: "Critical",
  P2_HIGH: "High",
  P3_MEDIUM: "Medium",
  P4_LOW: "Low",
  P5_INFO: "Informational",
};

const PRIORITY_STYLES: Record<
  string,
  { code: string; text: string; dot: string; bar: string }
> = {
  P1_CRITICAL: {
    code: "P1",
    text: "text-red-400",
    dot: "bg-red-500",
    bar: "bg-red-500",
  },
  P2_HIGH: {
    code: "P2",
    text: "text-orange-400",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },
  P3_MEDIUM: {
    code: "P3",
    text: "text-yellow-400",
    dot: "bg-yellow-500",
    bar: "bg-yellow-500",
  },
  P4_LOW: {
    code: "P4",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  P5_INFO: {
    code: "P5",
    text: "text-sky-400",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
  },
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  PAUSED: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  CLOSED: "border-red-500/40 bg-red-500/10 text-red-400",
  DRAFT: "border-zinc-600 bg-zinc-800 text-zinc-400",
};

const POINTS_MAP: Record<string, number> = {
  P1_CRITICAL: 100,
  P2_HIGH: 50,
  P3_MEDIUM: 25,
  P4_LOW: 10,
  P5_INFO: 5,
};

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const program = await db.program.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          name: true,
          logo: true,
          website: true,
          description: true,
          isVerified: true,
        },
      },
      scopes: { orderBy: { inScope: "desc" } },
      rules: { orderBy: { sortOrder: "asc" } },
      rewards: { orderBy: { priority: "asc" } },
      _count: { select: { reports: true } },
    },
  });

  if (!program) notFound();

  const inScopeItems = program.scopes.filter((s) => s.inScope);
  const outOfScopeItems = program.scopes.filter((s) => !s.inScope);
  const isResearcher = session?.user?.role === "RESEARCHER";
  const maxPoints = Math.max(
    ...Object.values(POINTS_MAP),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-zinc-300">
                  {program.company.name}
                </span>
                {program.company.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                    <BadgeCheck className="h-3 w-3" />
                    verified
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                    STATUS_STYLES[program.status] ?? STATUS_STYLES.DRAFT
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {program.status}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">
                {program.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                {program.description}
              </p>
            </div>

            {/* Submit CTA */}
            {isResearcher && (
              <Link
                href={`/reports/new?programId=${program.id}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 font-mono text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
              >
                <Shield className="h-4 w-4" />
                Submit Report
              </Link>
            )}
          </div>

          <div className="mt-6 h-px w-full bg-zinc-800" />
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* In Scope terminal */}
            <TerminalPanel
              title="in_scope.txt"
              icon={<Crosshair className="h-3.5 w-3.5 text-emerald-400" />}
              accent="emerald"
            >
              {inScopeItems.length === 0 ? (
                <p className="text-zinc-600">// no targets defined</p>
              ) : (
                <ul className="space-y-2.5">
                  {inScopeItems.map((scope, i) => (
                    <li key={scope.id} className="group/line">
                      <div className="flex items-start gap-3">
                        <span className="w-6 shrink-0 select-none text-right text-zinc-700">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="select-none text-emerald-500">
                          [+]
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="break-all font-semibold text-emerald-300 transition-colors group-hover/line:text-emerald-200">
                              {scope.target}
                            </span>
                            <span className="rounded border border-emerald-500/30 bg-emerald-500/5 px-1.5 py-px text-[10px] uppercase tracking-wider text-emerald-500">
                              {scope.type}
                            </span>
                          </div>
                          {scope.notes && (
                            <p className="mt-1 whitespace-pre-wrap text-zinc-500">
                              <span className="text-zinc-700"># </span>
                              {scope.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TerminalPanel>

            {/* Out of Scope terminal */}
            {outOfScopeItems.length > 0 && (
              <TerminalPanel
                title="out_of_scope.txt"
                icon={<Ban className="h-3.5 w-3.5 text-red-400" />}
                accent="red"
              >
                <div className="mb-3 flex items-center gap-2 rounded border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[11px] text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Testing these targets is prohibited and will not be rewarded.
                </div>
                <ul className="space-y-2.5">
                  {outOfScopeItems.map((scope, i) => (
                    <li key={scope.id} className="group/line">
                      <div className="flex items-start gap-3">
                        <span className="w-6 shrink-0 select-none text-right text-zinc-700">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="select-none text-red-500">[-]</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="break-all font-semibold text-red-300/90 line-through decoration-red-500/40 decoration-1 transition-colors group-hover/line:text-red-200">
                              {scope.target}
                            </span>
                            <span className="rounded border border-red-500/30 bg-red-500/5 px-1.5 py-px text-[10px] uppercase tracking-wider text-red-400">
                              {scope.type}
                            </span>
                          </div>
                          {scope.notes && (
                            <p className="mt-1 whitespace-pre-wrap text-zinc-500">
                              <span className="text-zinc-700"># </span>
                              {scope.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </TerminalPanel>
            )}

            {/* Rules */}
            {program.rules.length > 0 && (
              <Card className="border border-zinc-800 bg-zinc-900/70 ring-0">
                <CardHeader className="border-b border-zinc-800 pb-4">
                  <CardTitle className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-zinc-200">
                    <ScrollText className="h-4 w-4 text-emerald-400" />
                    Rules &amp; Guidelines
                    <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-zinc-600">
                      {program.rules.length} section
                      {program.rules.length === 1 ? "" : "s"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 divide-y divide-zinc-800/80">
                  {program.rules.map((rule, i) => (
                    <div key={rule.id} className="py-4 first:pt-0 last:pb-0">
                      <h4 className="flex items-baseline gap-2 font-semibold text-zinc-100">
                        <span className="font-mono text-xs text-emerald-500">
                          {(i + 1).toString().padStart(2, "0")}.
                        </span>
                        {rule.title}
                      </h4>
                      <p className="mt-2 whitespace-pre-wrap pl-7 text-sm leading-relaxed text-zinc-400">
                        {rule.content}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="border border-zinc-800 bg-zinc-900/70 ring-0">
              <CardHeader className="border-b border-zinc-800 pb-4">
                <CardTitle className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-zinc-200">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Program Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 font-mono text-sm">
                <StatRow label="reports" value={program._count.reports} />
                <StatRow
                  label="in_scope"
                  value={inScopeItems.length}
                  valueClass="text-emerald-400"
                />
                <StatRow
                  label="out_of_scope"
                  value={outOfScopeItems.length}
                  valueClass="text-red-400"
                />
                <StatRow
                  label="max_points"
                  value={`${maxPoints} pts`}
                  valueClass="text-emerald-400"
                />
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <span className="text-zinc-500">status</span>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                      STATUS_STYLES[program.status] ?? STATUS_STYLES.DRAFT
                    }`}
                  >
                    {program.status}
                  </span>
                </div>
                {program.company.website && (
                  <div className="border-t border-zinc-800 pt-3">
                    <a
                      href={program.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-zinc-400 transition-colors hover:text-emerald-400"
                    >
                      <span>website</span>
                      <span className="flex items-center gap-1 truncate pl-3 text-xs">
                        <span className="truncate">
                          {program.company.website.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </span>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Points per Severity */}
            <Card className="border border-zinc-800 bg-zinc-900/70 ring-0">
              <CardHeader className="border-b border-zinc-800 pb-4">
                <CardTitle className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-zinc-200">
                  <Trophy className="h-4 w-4 text-emerald-400" />
                  Points
                </CardTitle>
                <p className="font-mono text-[11px] text-zinc-500">
                  points awarded by severity
                </p>
              </CardHeader>
              <CardContent className="p-0 px-0">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-600">
                      <th className="px-4 py-2 text-left font-medium">
                        severity
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {(
                      [
                        "P1_CRITICAL",
                        "P2_HIGH",
                        "P3_MEDIUM",
                        "P4_LOW",
                        "P5_INFO",
                      ] as const
                    ).map((priority) => {
                      const s =
                        PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.P5_INFO;
                      const pts = POINTS_MAP[priority] ?? 0;
                      const pct =
                        maxPoints > 0
                          ? Math.max(6, Math.round((pts / maxPoints) * 100))
                          : 0;
                      return (
                        <tr
                          key={priority}
                          className="group/row transition-colors hover:bg-zinc-800/40"
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${s.dot}`}
                              />
                              <span className={`font-semibold ${s.text}`}>
                                {s.code}
                              </span>
                              <span className="text-zinc-300">
                                {PRIORITY_LABELS[priority] ?? priority}
                              </span>
                            </div>
                            <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded bg-zinc-800">
                              <div
                                className={`h-full ${s.bar} opacity-60 transition-opacity group-hover/row:opacity-100`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right align-top">
                            <span className="font-semibold text-zinc-100">
                              {pts}
                            </span>
                            <span className="ml-1 text-zinc-500">pts</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Not-a-researcher hint */}
            {!isResearcher && (
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs text-zinc-500">
                <span className="text-emerald-500">$</span> sign in as a
                researcher to submit findings to this program.
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

function TerminalPanel({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: ReactNode;
  accent: "emerald" | "red";
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
        <div className="ml-1 flex items-center gap-1.5 font-mono text-xs text-zinc-400">
          {icon}
          <span>{title}</span>
        </div>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed sm:text-[13px]">
        {children}
      </div>
    </section>
  );
}

function StatRow({
  label,
  value,
  valueClass = "text-zinc-100",
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
