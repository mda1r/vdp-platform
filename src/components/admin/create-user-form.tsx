"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLE_OPTIONS = [
  { value: "RESEARCHER", label: "Researcher" },
  { value: "ADMIN", label: "Triage / Admin" },
] as const;

export function CreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("RESEARCHER");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
      role,
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create user");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2 border-emerald-500/30 font-mono text-xs text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Create User
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Create User
        </h3>
        <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Name
            </label>
            <Input
              name="name"
              required
              placeholder="User name"
              className="h-9 border-zinc-800 bg-zinc-950 font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Email
            </label>
            <Input
              name="email"
              type="email"
              required
              placeholder="user@example.com"
              className="h-9 border-zinc-800 bg-zinc-950 font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Password
            </label>
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Min 8 characters"
              className="h-9 border-zinc-800 bg-zinc-950 font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 font-mono text-sm text-zinc-200 outline-none focus:border-emerald-500/50"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2 bg-emerald-500/10 font-mono text-xs text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
            Create
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="font-mono text-xs text-zinc-500"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
