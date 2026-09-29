"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, AlertTriangle, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function CommentForm({
  reportId,
  canPostInternal,
}: {
  reportId: string;
  canPostInternal: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isInternal }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to post comment");
      }
      setContent("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 shadow-[0_0_12px_rgba(239,68,68,0.08)]">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <span className="font-mono text-xs text-red-300">{error}</span>
        </div>
      )}

      {/* Textarea with terminal prompt */}
      <div className="relative">
        <span
          className={`absolute left-3 top-3 font-mono text-sm font-bold ${
            isInternal ? "text-amber-500/60" : "text-emerald-500/40"
          }`}
        >
          $
        </span>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isInternal
              ? "Internal note (visible only to company & admin)..."
              : "Add a comment..."
          }
          rows={4}
          className={`resize-none pl-7 font-mono text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-200 ${
            isInternal
              ? "border-amber-500/30 bg-amber-950/10 text-amber-100 placeholder:text-amber-500/30 focus:border-amber-500/50 focus:ring-amber-500/20 focus:shadow-[0_0_16px_rgba(245,158,11,0.08)]"
              : "border-zinc-800 bg-zinc-950 text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 focus:shadow-[0_0_16px_rgba(16,185,129,0.08)]"
          }`}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Internal note toggle */}
          {canPostInternal && (
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-200 ${
                  isInternal
                    ? "border-amber-500/50 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                }`}
              >
                {isInternal && (
                  <svg
                    className="h-2.5 w-2.5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <EyeOff
                className={`h-3.5 w-3.5 transition-colors duration-200 ${
                  isInternal ? "text-amber-400" : "text-zinc-600"
                }`}
              />
              <span
                className={`font-mono text-xs transition-colors duration-200 ${
                  isInternal ? "text-amber-300" : "text-zinc-500"
                }`}
              >
                Internal note (hidden from researcher)
              </span>
            </label>
          )}

          {/* Encrypted channel indicator */}
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500/40" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Encrypted channel
            </span>
          </div>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading || !content.trim()}
          className={`gap-2 rounded-lg border px-4 font-mono text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${
            isInternal
              ? "border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.08)] hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.08)] hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {isInternal ? "Post Note" : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}
