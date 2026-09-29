"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Bug, AlertTriangle, Terminal, Send, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createReportSchema,
  VULN_TYPES,
  SEVERITY_LEVELS,
  type CreateReportInput,
} from "@/lib/validations/report";

interface Program {
  id: string;
  title: string;
  company: { name: string };
}

const FIELD =
  "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 focus-visible:ring-[3px]";

const SELECT =
  "flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-zinc-100 outline-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-[3px] focus-visible:ring-emerald-500/30 [&>option]:bg-zinc-950";

const LABEL = "font-mono text-xs uppercase tracking-wider text-zinc-400";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 font-mono text-xs text-red-400">
      <span className="text-red-500">!</span> {message}
    </p>
  );
}

export default function NewReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <NewReportForm />
    </Suspense>
  );
}

function NewReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProgramId = searchParams.get("programId");

  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      programId: preselectedProgramId ?? "",
    },
  });

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => setPrograms(data.programs ?? []))
      .catch(() => {});
  }, []);

  async function onSubmit(data: CreateReportInput) {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to submit report");
        setIsLoading(false);
        return;
      }
      router.push(`/reports/${json.report.id}`);
    } catch {
      setError("Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Submit Vulnerability Report
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Provide detailed information about the vulnerability you found.
          Reports are encrypted at rest.
        </p>
      </div>

      {/* Encryption notice */}
      <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 font-mono text-xs text-emerald-400">
        <Lock className="h-3.5 w-3.5" />
        <span>AES-256 Encrypted</span>
      </div>

      {/* Form panel */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3 font-mono text-sm text-zinc-300">
          <span className="text-emerald-500">&gt;</span>
          <Bug className="h-3.5 w-3.5 text-zinc-500" />
          <span className="uppercase tracking-wider">New Report</span>
        </div>

        <div className="p-5 sm:p-6">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 font-mono text-sm text-red-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Program select */}
            <div className="space-y-2">
              <Label htmlFor="programId" className={LABEL}>
                Program
              </Label>
              <select id="programId" {...register("programId")} className={SELECT}>
                <option value="">Select a program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} &mdash; {p.company.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors.programId?.message} />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className={LABEL}>
                Title
              </Label>
              <Input
                id="title"
                placeholder="Brief description of the vulnerability"
                className={FIELD}
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>

            {/* Vuln type + Severity row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vulnType" className={LABEL}>
                  Vulnerability Type
                </Label>
                <select id="vulnType" {...register("vulnType")} className={SELECT}>
                  <option value="">Select type</option>
                  {VULN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.vulnType?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity" className={LABEL}>
                  Severity
                </Label>
                <select id="severity" {...register("severity")} className={SELECT}>
                  <option value="">Select severity</option>
                  {SEVERITY_LEVELS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.severity?.message} />
              </div>
            </div>

            {/* CVSS Score */}
            <div className="space-y-2">
              <Label htmlFor="cvssScore" className={LABEL}>
                CVSS Score{" "}
                <span className="normal-case tracking-normal text-zinc-600">
                  (optional)
                </span>
              </Label>
              <Input
                id="cvssScore"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="0.0 - 10.0"
                className={`${FIELD} font-mono sm:max-w-[200px]`}
                {...register("cvssScore", { valueAsNumber: true })}
              />
              <FieldError message={errors.cvssScore?.message} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className={LABEL}>
                Description
              </Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Detailed description of the vulnerability, impact, and affected components..."
                className={FIELD}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>

            {/* Steps to Reproduce */}
            <div className="space-y-2">
              <Label htmlFor="stepsToReproduce" className={LABEL}>
                Steps to Reproduce
              </Label>
              <Textarea
                id="stepsToReproduce"
                rows={6}
                placeholder={"1. Navigate to...\n2. Enter...\n3. Observe that..."}
                className={`${FIELD} font-mono text-xs`}
                {...register("stepsToReproduce")}
              />
              <FieldError message={errors.stepsToReproduce?.message} />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full bg-emerald-500 font-mono font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </div>
      </div>

      {/* Encryption footer note */}
      <div className="flex items-center justify-center gap-2 font-mono text-[11px] text-zinc-600">
        <Lock className="h-3 w-3" />
        <span>All submissions are encrypted at rest</span>
      </div>
    </div>
  );
}
