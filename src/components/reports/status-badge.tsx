import { cn } from "@/lib/utils";
import {
  formatPriority,
  formatStatus,
  maskStatus,
  PRIORITY_STYLES,
  STATUS_DOT,
  STATUS_STYLES,
} from "@/lib/report-status";

/* ------------------------------------------------------------------ */
/*  Glow mappings for elevated depth                                  */
/* ------------------------------------------------------------------ */

/** Subtle shadow glow per status for active states. */
const STATUS_GLOW: Record<string, string> = {
  NEW: "shadow-[0_0_8px_rgba(59,130,246,0.15)] animate-pulse-glow",
  TRIAGED: "shadow-[0_0_8px_rgba(245,158,11,0.12)]",
  ACCEPTED: "shadow-[0_0_8px_rgba(16,185,129,0.15)]",
  RESOLVED: "shadow-[0_0_8px_rgba(94,234,212,0.12)]",
  DUPLICATE: "shadow-[0_0_6px_rgba(249,115,22,0.10)]",
  OUT_OF_SCOPE: "shadow-[0_0_6px_rgba(239,68,68,0.10)]",
  NOT_APPLICABLE: "shadow-[0_0_6px_rgba(239,68,68,0.10)]",
  SPAM: "shadow-[0_0_6px_rgba(220,38,38,0.12)]",
};

/** Red glow for critical priority. */
const PRIORITY_GLOW: Record<string, string> = {
  P1_CRITICAL:
    "shadow-[0_0_10px_rgba(239,68,68,0.2),0_0_20px_rgba(239,68,68,0.08)] border-red-500/50",
};

/* ------------------------------------------------------------------ */
/*  StatusBadge                                                       */
/* ------------------------------------------------------------------ */

/**
 * Status pill. Always pass `canSeeInternal` so RESOLVED is masked as ACCEPTED
 * for researchers. Server-component safe (no hooks).
 */
export function StatusBadge({
  status,
  canSeeInternal,
  size = "sm",
  className,
}: {
  status: string;
  canSeeInternal: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const shown = maskStatus(status, canSeeInternal);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono uppercase tracking-wider transition-shadow duration-300",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        STATUS_STYLES[shown] ?? "border-zinc-700 bg-zinc-800/60 text-zinc-400",
        STATUS_GLOW[shown],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full ring-1 ring-current/20",
          STATUS_DOT[shown] ?? "bg-zinc-500",
          shown === "NEW" && "animate-pulse"
        )}
      />
      {formatStatus(shown)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  PriorityBadge                                                     */
/* ------------------------------------------------------------------ */

export function PriorityBadge({
  priority,
  size = "sm",
  className,
}: {
  priority: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-mono uppercase tracking-wider transition-shadow duration-300",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        PRIORITY_STYLES[priority] ??
          "border-zinc-700 bg-zinc-800/60 text-zinc-400",
        PRIORITY_GLOW[priority],
        className
      )}
    >
      {formatPriority(priority)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Tag                                                               */
/* ------------------------------------------------------------------ */

/** Neutral mono tag used for vuln type, severity, CVSS, roles, etc. */
export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-zinc-800/80 bg-zinc-900/80 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_1px_2px_rgba(0,0,0,0.3)] transition-colors duration-200 hover:border-zinc-700 hover:text-zinc-300",
        className
      )}
    >
      {children}
    </span>
  );
}
