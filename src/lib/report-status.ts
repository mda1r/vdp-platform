/**
 * Report status helpers.
 *
 * Researchers must never learn whether a company has internally fixed
 * (RESOLVED) a report. From their point of view a RESOLVED report is simply
 * ACCEPTED. Every place that renders a status to a viewer should go through
 * `maskStatus` with the viewer's privilege level.
 */

/** Statuses a researcher is allowed to see. RESOLVED is intentionally absent. */
export const RESEARCHER_VISIBLE_STATUSES = [
  "NEW",
  "TRIAGED",
  "ACCEPTED",
  "CLOSED",
  "DUPLICATE",
  "INFORMATIVE",
  "OUT_OF_SCOPE",
  "NOT_APPLICABLE",
  "SPAM",
] as const;

/**
 * Returns the status a given viewer should see.
 *
 * @param status            raw status from the database
 * @param canSeeInternal    true for the program's company owner or an admin
 */
export function maskStatus(status: string, canSeeInternal: boolean): string {
  if (!canSeeInternal && status === "RESOLVED") return "ACCEPTED";
  return status;
}

/** "OUT_OF_SCOPE" -> "OUT OF SCOPE" */
export function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

/** "P1_CRITICAL" -> "P1 CRITICAL" */
export function formatPriority(priority: string): string {
  return priority.replace("_", " ");
}

/** Dark-theme badge classes per status. */
export const STATUS_STYLES: Record<string, string> = {
  NEW: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  TRIAGED: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  ACCEPTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  RESOLVED: "border-teal-500/30 bg-teal-500/10 text-teal-300",
  CLOSED: "border-zinc-700 bg-zinc-800/60 text-zinc-400",
  DUPLICATE: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  INFORMATIVE: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  OUT_OF_SCOPE: "border-red-500/30 bg-red-500/10 text-red-400",
  NOT_APPLICABLE: "border-red-500/30 bg-red-500/10 text-red-400",
  SPAM: "border-red-600/40 bg-red-600/15 text-red-500",
};

/** Dot colour that accompanies each status badge. */
export const STATUS_DOT: Record<string, string> = {
  NEW: "bg-blue-400",
  TRIAGED: "bg-amber-400",
  ACCEPTED: "bg-emerald-400",
  RESOLVED: "bg-teal-300",
  CLOSED: "bg-zinc-500",
  DUPLICATE: "bg-orange-400",
  INFORMATIVE: "bg-purple-400",
  OUT_OF_SCOPE: "bg-red-400",
  NOT_APPLICABLE: "bg-red-400",
  SPAM: "bg-red-500",
};

/** Dark-theme badge classes per priority. */
export const PRIORITY_STYLES: Record<string, string> = {
  P1_CRITICAL: "border-red-500/40 bg-red-500/10 text-red-400",
  P2_HIGH: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  P3_MEDIUM: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  P4_LOW: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  P5_INFO: "border-zinc-700 bg-zinc-800/60 text-zinc-400",
};
