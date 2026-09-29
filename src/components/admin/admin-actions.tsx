"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ban, ShieldCheck, BadgeCheck, Shield, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types & style maps                                                */
/* ------------------------------------------------------------------ */

type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

const VARIANT_CLASSES: Record<Variant, string> = {
  default:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:shadow-[0_0_16px_rgba(16,185,129,0.3),inset_0_0_12px_rgba(16,185,129,0.06)] active:shadow-[0_0_8px_rgba(16,185,129,0.4),inset_0_1px_3px_rgba(0,0,0,0.3)] focus-visible:ring-emerald-500/40",
  destructive:
    "border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-400 hover:bg-red-500/20 hover:text-red-300 hover:shadow-[0_0_16px_rgba(239,68,68,0.3),inset_0_0_12px_rgba(239,68,68,0.06)] active:shadow-[0_0_8px_rgba(239,68,68,0.4),inset_0_1px_3px_rgba(0,0,0,0.3)] focus-visible:ring-red-500/40",
  outline:
    "border-zinc-700 bg-zinc-900/60 text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-100 hover:shadow-[0_0_10px_rgba(16,185,129,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]",
  secondary:
    "border-zinc-800 bg-zinc-900 text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:bg-zinc-800 hover:text-zinc-100 hover:shadow-[0_0_8px_rgba(16,185,129,0.06)] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]",
  ghost:
    "border-transparent bg-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 hover:shadow-[0_0_8px_rgba(16,185,129,0.05)]",
  link: "border-transparent bg-transparent text-emerald-400 underline-offset-4 hover:underline hover:text-emerald-300 hover:drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]",
};

const ACTION_ICONS: Record<string, typeof Ban> = {
  ban: Ban,
  unban: ShieldCheck,
  verify_company: BadgeCheck,
  make_admin: Shield,
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function AdminActions({
  userId,
  action,
  label,
  variant = "default",
}: {
  userId: string;
  action: string;
  label: string;
  variant?: Variant;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction() {
    setIsLoading(true);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  const Icon = ACTION_ICONS[action] ?? Terminal;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleAction}
      disabled={isLoading}
      className={`gap-1.5 rounded-md border font-mono text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]}`}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {label}
    </Button>
  );
}
