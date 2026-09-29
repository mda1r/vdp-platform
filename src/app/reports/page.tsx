import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { Bug, Plus, ChevronRight, Terminal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, PriorityBadge, Tag } from "@/components/reports/status-badge";

export default async function ReportsPage() {
  const session = await requireAuth();

  let where: Record<string, unknown> = {};

  if (session.user.role === "RESEARCHER") {
    where = { researcherId: session.user.id };
  } else if (session.user.role === "COMPANY") {
    const company = await db.company.findUnique({
      where: { userId: session.user.id },
      include: { programs: { select: { id: true } } },
    });
    if (company) {
      where = { programId: { in: company.programs.map((p) => p.id) } };
    }
  }

  const reports = await db.report.findMany({
    where,
    include: {
      researcher: { select: { id: true, name: true } },
      program: { select: { id: true, title: true, company: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const isResearcher = session.user.role === "RESEARCHER";
  // Researchers never see RESOLVED; it is masked as ACCEPTED.
  const canSeeInternal = !isResearcher;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            {isResearcher ? "My Reports" : "Incoming Reports"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isResearcher
              ? "Track your submitted vulnerability reports"
              : "Review and manage vulnerability reports"}
          </p>
        </div>
        {isResearcher && (
          <Link
            href="/reports/new"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-500 px-4 font-mono text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            New Report
          </Link>
        )}
      </div>

      {/* Table panel */}
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-5 py-3">
          <div className="flex items-center gap-2 font-mono text-sm text-zinc-300">
            <span className="text-emerald-500">&gt;</span>
            <span className="uppercase tracking-wider">Reports</span>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            [{reports.length}] total
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full border border-zinc-800 bg-zinc-900 p-4">
              <Bug className="h-8 w-8 text-zinc-600" />
            </div>
            <p className="mt-4 font-mono text-sm text-zinc-500">
              No reports found.
            </p>
            {isResearcher && (
              <Link
                href="/programs"
                className="mt-2 font-mono text-xs text-emerald-500 transition-colors hover:text-emerald-400 hover:underline"
              >
                browse programs &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    Title
                  </TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    {isResearcher ? "Program" : "Researcher"}
                  </TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    Status
                  </TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    Priority
                  </TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    Type
                  </TableHead>
                  <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    Date
                  </TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="group border-zinc-800/80 transition-colors hover:bg-emerald-500/5"
                  >
                    <TableCell className="max-w-[320px]">
                      <Link
                        href={`/reports/${report.id}`}
                        className="block truncate font-medium text-zinc-100 transition-colors group-hover:text-emerald-400"
                      >
                        {report.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {isResearcher ? report.program.title : report.researcher.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={report.status}
                        canSeeInternal={canSeeInternal}
                      />
                    </TableCell>
                    <TableCell>
                      {report.priority ? (
                        <PriorityBadge priority={report.priority} />
                      ) : (
                        <span className="font-mono text-xs text-zinc-600">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tag>{report.vulnType}</Tag>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-zinc-500">
                      {format(new Date(report.createdAt), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-zinc-700 transition-colors group-hover:text-emerald-500" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
