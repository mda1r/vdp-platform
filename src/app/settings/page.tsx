"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Save,
  Terminal,
  User,
  Globe,
  GitBranch,
  AtSign,
  Cpu,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: "",
    website: "",
    github: "",
    twitter: "",
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile/${session!.user!.id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            name: data.name || "",
            bio: data.bio || "",
            skills: data.skills?.join(", ") || "",
            website: data.website || "",
            github: data.github || "",
            twitter: data.twitter || "",
          });
        }
      } catch {
        // Profile may not exist yet
      }
    }

    fetchProfile();
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const skillPreview = form.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500 font-mono">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">
          Profile Settings
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Configure your researcher identity
        </p>

        {/* Error display */}
        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-950/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-mono text-red-400 text-sm font-semibold">
                [ERR]
              </span>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success display */}
        {success && (
          <div className="mb-6 border border-emerald-500/30 bg-emerald-950/20 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-mono text-emerald-400 text-sm font-semibold">
                [OK]
              </span>
              <p className="text-emerald-300 text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Main settings card */}
        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm">
          <CardHeader className="border-b border-zinc-800/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
                <User className="h-4 w-4 text-emerald-500" />
                <span>PROFILE INFORMATION</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-zinc-300 font-mono text-sm flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5 text-emerald-500" />
                  display_name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Your display name"
                  className="bg-zinc-900/70 border-zinc-700/50 text-zinc-200 font-mono placeholder:text-zinc-600 focus:ring-emerald-500/40 focus:border-emerald-500/40"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label
                  htmlFor="bio"
                  className="text-zinc-300 font-mono text-sm flex items-center gap-2"
                >
                  <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                  bio
                </Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself as a security researcher..."
                  rows={4}
                  className="bg-zinc-900/70 border-zinc-700/50 text-zinc-200 font-mono placeholder:text-zinc-600 focus:ring-emerald-500/40 focus:border-emerald-500/40 resize-none"
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label
                  htmlFor="skills"
                  className="text-zinc-300 font-mono text-sm flex items-center gap-2"
                >
                  <Cpu className="h-3.5 w-3.5 text-emerald-500" />
                  skills
                  <span className="text-zinc-600 text-xs">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="skills"
                  value={form.skills}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, skills: e.target.value }))
                  }
                  placeholder="XSS, SQL Injection, IDOR, API Security..."
                  className="bg-zinc-900/70 border-zinc-700/50 text-zinc-200 font-mono placeholder:text-zinc-600 focus:ring-emerald-500/40 focus:border-emerald-500/40"
                />
                {/* Skill preview tags */}
                {skillPreview.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skillPreview.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs font-mono"
                      >
                        <span className="text-emerald-600 mr-1">#</span>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label
                  htmlFor="website"
                  className="text-zinc-300 font-mono text-sm flex items-center gap-2"
                >
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, website: e.target.value }))
                  }
                  placeholder="https://yoursite.com"
                  className="bg-zinc-900/70 border-zinc-700/50 text-zinc-200 font-mono placeholder:text-zinc-600 focus:ring-emerald-500/40 focus:border-emerald-500/40"
                />
              </div>

              {/* GitHub + Twitter in 2-col grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GitHub */}
                <div className="space-y-2">
                  <Label
                    htmlFor="github"
                    className="text-zinc-300 font-mono text-sm flex items-center gap-2"
                  >
                    <GitBranch className="h-3.5 w-3.5 text-emerald-500" />
                    github
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">
                      @
                    </span>
                    <Input
                      id="github"
                      value={form.github}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, github: e.target.value }))
                      }
                      placeholder="username"
                      className="bg-zinc-900/70 border-zinc-700/50 text-zinc-200 font-mono placeholder:text-zinc-600 focus:ring-emerald-500/40 focus:border-emerald-500/40 pl-8"
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="twitter"
                    className="text-zinc-300 font-mono text-sm flex items-center gap-2"
                  >
                    <AtSign className="h-3.5 w-3.5 text-emerald-500" />
                    twitter
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">
                      @
                    </span>
                    <Input
                      id="twitter"
                      value={form.twitter}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, twitter: e.target.value }))
                      }
                      placeholder="handle"
                      className="bg-zinc-900/70 border-zinc-700/50 text-zinc-200 font-mono placeholder:text-zinc-600 focus:ring-emerald-500/40 focus:border-emerald-500/40 pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                <p className="text-zinc-600 font-mono text-xs hidden sm:block">
                  $ git commit -m &apos;update profile&apos;
                </p>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-transparent border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 font-mono transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
