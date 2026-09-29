export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import {
  Globe,
  BadgeCheck,
  FileText,
  ChevronRight,
  Shield,
} from "lucide-react";

export default async function ProgramsPage() {
  const programs = await db.program.findMany({
    where: { status: "ACTIVE" },
    include: {
      company: { select: { name: true, logo: true, isVerified: true } },
      scopes: { where: { inScope: true }, take: 5 },
      rewards: { orderBy: { priority: "asc" } },
      _count: { select: { reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalTargets = programs.reduce((n, p) => n + p.scopes.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Programs
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Active vulnerability disclosure programs. Pick a target, stay in scope, earn recognition.
        </p>
      </div>

        {programs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">No active programs at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="group block rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                      <span>{program.company.name}</span>
                      {program.company.isVerified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-300">
                      {program.title}
                    </h2>
                    {program.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                        {program.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-emerald-400" />
                </div>

                {/* Scope targets */}
                {program.scopes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {program.scopes.map((scope) => (
                      <span
                        key={scope.id}
                        className="inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-400"
                      >
                        <Globe className="h-3 w-3 text-zinc-600" />
                        {scope.target}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {program._count.reports} reports
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    points + recognition
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      <p className="mt-6 text-center text-xs text-zinc-600">
        {programs.length} active program{programs.length !== 1 ? "s" : ""} &middot; {totalTargets} targets
      </p>
    </div>
  );
}
