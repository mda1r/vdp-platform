"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  SlidersHorizontal,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Options                                                           */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "TRIAGED", label: "Triaged" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DUPLICATE", label: "Duplicate" },
  { value: "INFORMATIVE", label: "Informative" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
  { value: "OUT_OF_SCOPE", label: "Out of Scope (-10 pts)" },
  { value: "SPAM", label: "Spam (-25 pts)" },
];

const PRIORITY_OPTIONS = [
  { value: "P1_CRITICAL", label: "P1 - Critical" },
  { value: "P2_HIGH", label: "P2 - High" },
  { value: "P3_MEDIUM", label: "P3 - Medium" },
  { value: "P4_LOW", label: "P4 - Low" },
  { value: "P5_INFO", label: "P5 - Informational" },
];

/* ------------------------------------------------------------------ */
/*  Shared select styling                                             */
/* ------------------------------------------------------------------ */

const SELECT_CLASS =
  "w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_1px_2px_rgba(0,0,0,0.3)] outline-none transition-all duration-200 focus:border-emerald-500/50 focus:shadow-[0_0_12px_rgba(16,185,129,0.1)] focus:ring-1 focus:ring-emerald-500/30";

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function ReportStatusActions({
  reportId,
  currentStatus,
  currentPriority,
}: {
  reportId: string;
  currentStatus: string;
  currentPriority: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = status !== currentStatus || priority !== (currentPriority ?? "");

  async function handleUpdate() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority: priority || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update status");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const isDestructiveStatus = status === "SPAM" || status === "OUT_OF_SCOPE";

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/40 shadow-[0_0_24px_rgba(16,185,129,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
          <span className="font-mono text-sm font-semibold uppercase tracking-wider text-emerald-400">
            {">"} Triage Controls
          </span>
        </div>
        <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          company / admin
        </span>
      </div>

      <div className="p-5">
        {/* Error display */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 shadow-[0_0_12px_rgba(239,68,68,0.08)]">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
            <span className="font-mono text-xs text-red-300">{error}</span>
          </div>
        )}

        {/* Status & Priority selects */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Status */}
          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={SELECT_CLASS}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">No priority</option>
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destructive status warning */}
        {isDestructiveStatus && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
            <span className="font-mono text-[11px] leading-relaxed text-amber-300/80">
              {status === "SPAM"
                ? "SPAM deducts -25 pts from the researcher's score."
                : "OUT_OF_SCOPE deducts -10 pts from the researcher's score."}
            </span>
          </div>
        )}

        {/* General deduction note */}
        <p className="mt-3 font-mono text-[10px] text-zinc-600">
          Note: SPAM deducts -25 pts, OUT_OF_SCOPE deducts -10 pts from
          researcher
        </p>

        {/* Apply button */}
        <div className="mt-4">
          <Button
            onClick={handleUpdate}
            disabled={!isDirty || isLoading}
            className="gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-5 font-mono text-sm font-semibold uppercase tracking-wider text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.08)] transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isLoading ? "Applying..." : "Apply Changes"}
          </Button>
        </div>

        {/* Info note */}
        <p className="mt-3 font-mono text-[10px] text-zinc-600">
          <span className="text-zinc-500">$</span> researchers see RESOLVED as
          ACCEPTED
        </p>
      </div>
    </div>
  );
}
