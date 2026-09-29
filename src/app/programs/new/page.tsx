"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Loader2, Terminal, FolderPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ScopeItem {
  target: string;
  type: string;
  inScope: boolean;
  notes: string;
}

interface RuleItem {
  title: string;
  content: string;
}

const inputClass =
  "h-9 border-zinc-800 bg-zinc-900/70 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20";

const cardClass =
  "border border-zinc-800 bg-zinc-950/80 text-zinc-100 ring-0";

const labelClass =
  "font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500";

const selectClass =
  "h-9 rounded-md border border-zinc-800 bg-zinc-900/70 px-3 text-sm text-zinc-100 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/20";

export default function NewProgramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scopes, setScopes] = useState<ScopeItem[]>([
    { target: "", type: "web", inScope: true, notes: "" },
  ]);
  const [rules, setRules] = useState<RuleItem[]>([]);

  function addScope() {
    setScopes((s) => [...s, { target: "", type: "web", inScope: true, notes: "" }]);
  }

  function removeScope(i: number) {
    setScopes((s) => s.filter((_, idx) => idx !== i));
  }

  function updateScope(i: number, field: keyof ScopeItem, value: string | boolean) {
    setScopes((s) =>
      s.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    );
  }

  function addRule() {
    setRules((r) => [...r, { title: "", content: "" }]);
  }

  function removeRule(i: number) {
    setRules((r) => r.filter((_, idx) => idx !== i));
  }

  function updateRule(i: number, field: keyof RuleItem, value: string) {
    setRules((r) =>
      r.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          scopes: scopes.filter((s) => s.target.trim()),
          rules: rules.filter((r) => r.title.trim() && r.content.trim()),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create program");
        setIsLoading(false);
        return;
      }
      router.push(`/programs/${json.program.id}`);
    } catch {
      setError("Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 text-zinc-100">
      <Link
        href="/programs"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="mb-6 border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Create Program
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Define a new vulnerability disclosure program.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 font-mono text-xs text-red-400">
          <span className="text-red-500">[ERR]</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={cardClass}>
          <CardHeader className="border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400">
                <FolderPlus className="h-4 w-4" />
              </div>
              <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
                Program Details
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className={labelClass}>Program Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Web Application VDP"
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe your program, what you're looking for..."
                className={`${inputClass} h-auto min-h-24 resize-y`}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="border-b border-zinc-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400">
                  <span className="font-mono text-xs">{ }</span>
                </div>
                <div>
                  <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
                    Scope
                  </h2>
                  <p className="text-xs text-zinc-500">Define in/out of scope targets</p>
                </div>
              </div>
              <span className="font-mono text-xs text-zinc-500">[{scopes.length}]</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {scopes.map((scope, i) => (
              <div
                key={i}
                className="flex flex-wrap gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
              >
                <div className="flex-1 min-w-[200px]">
                  <Input
                    value={scope.target}
                    onChange={(e) => updateScope(i, "target", e.target.value)}
                    placeholder="*.example.com"
                    className={`${inputClass} font-mono text-sm`}
                  />
                </div>
                <select
                  value={scope.type}
                  onChange={(e) => updateScope(i, "type", e.target.value)}
                  className={selectClass}
                >
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="api">API</option>
                  <option value="network">Network</option>
                  <option value="iot">IoT</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={scope.inScope ? "in" : "out"}
                  onChange={(e) =>
                    updateScope(i, "inScope", e.target.value === "in")
                  }
                  className={selectClass}
                >
                  <option value="in">In Scope</option>
                  <option value="out">Out of Scope</option>
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeScope(i)}
                  disabled={scopes.length === 1}
                  className="text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addScope}
              className="gap-2 border-zinc-800 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400"
            >
              <Plus className="h-4 w-4" />
              Add Scope
            </Button>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="border-b border-zinc-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400">
                  <span className="font-mono text-xs">#</span>
                </div>
                <div>
                  <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
                    Rules
                  </h2>
                  <p className="text-xs text-zinc-500">Guidelines for researchers</p>
                </div>
              </div>
              <span className="font-mono text-xs text-zinc-500">[{rules.length}]</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
              >
                <div className="flex gap-2">
                  <Input
                    value={rule.title}
                    onChange={(e) => updateRule(i, "title", e.target.value)}
                    placeholder="Rule title"
                    className={`${inputClass} flex-1`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRule(i)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={rule.content}
                  onChange={(e) => updateRule(i, "content", e.target.value)}
                  placeholder="Rule description"
                  rows={2}
                  className={`${inputClass} h-auto resize-y`}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addRule}
              className="gap-2 border-zinc-800 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full gap-2 border border-emerald-500/40 bg-emerald-500/15 font-mono text-sm font-semibold uppercase tracking-wider text-emerald-400 transition-all hover:border-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 hover:shadow-[0_0_16px_rgba(16,185,129,0.3)]"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Terminal className="h-4 w-4" />
          )}
          Create Program
        </Button>
      </form>
    </div>
  );
}
