import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Bug,
  Trophy,
  ArrowRight,
  Crosshair,
  AlertTriangle,
  Target,
  Crown,
  Flame,
  Award,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TERMINAL_LINES: { text: string; tone: "cmd" | "ok" | "warn" | "crit" | "dim" }[] = [
  { text: "$ ./recon --target jahez.sa --deep", tone: "cmd" },
  { text: "[+] 14 subdomains resolved", tone: "ok" },
  { text: "[+] api.jahez.sa :: 443/tcp open :: TLS 1.3", tone: "ok" },
  { text: "[+] mapping attack surface... 312 endpoints", tone: "dim" },
  { text: "$ ./probe idor --endpoint /v2/orders/{id}", tone: "cmd" },
  { text: "[!] auth bypass confirmed :: cross-tenant read", tone: "warn" },
  { text: "[!!] severity=P1_CRITICAL cvss=9.1", tone: "crit" },
  { text: "$ ./submit_report --severity P1 --poc ./poc.md", tone: "cmd" },
  { text: "[ok] report #4821 -> TRIAGED in 06h 12m", tone: "ok" },
  { text: "[ok] +100 pts awarded -> rank #3 ^", tone: "ok" },
];

const SEVERITIES = [
  { code: "P1", name: "Critical", pts: 100, cls: "sev-p1", pct: 100 },
  { code: "P2", name: "High", pts: 50, cls: "sev-p2", pct: 50 },
  { code: "P3", name: "Medium", pts: 25, cls: "sev-p3", pct: 25 },
  { code: "P4", name: "Low", pts: 10, cls: "sev-p4", pct: 10 },
  { code: "P5", name: "Info", pts: 5, cls: "sev-p5", pct: 5 },
];

const STEPS = [
  {
    n: "01",
    icon: Target,
    title: "Pick a Target",
    cmd: "ls ./programs --active",
    body: "Browse live programs, read the scope like a contract, and choose your attack surface. Out-of-scope shots cost you points.",
  },
  {
    n: "02",
    icon: Crosshair,
    title: "Hunt & Report",
    cmd: "./submit_report --poc",
    body: "Find something real. Write a report a triager can reproduce in minutes: clear steps, clean PoC, honest impact. Volume is noise.",
  },
  {
    n: "03",
    icon: Crown,
    title: "Earn Your Rank",
    cmd: "sort -rn ./hall_of_fame",
    body: "Points per severity, badges for milestones, and a seat in the Hall of Fame. The top three carry titles everyone can see.",
  },
];

const PENALTIES = [
  {
    tag: "-25 pts",
    title: "Spam Reports",
    body: "Low-effort, duplicate, automated or irrelevant submissions. Each one deducts 25 points from your score.",
  },
  {
    tag: "-10 pts",
    title: "Out-of-Scope Submissions",
    body: "Testing or reporting on targets not listed in a program's scope. Read the scope before you touch anything.",
  },
  {
    tag: "BAN",
    title: "Report Form Abuse",
    body: "Attempting to exploit the submission form itself (XSS, injection, upload abuse) ends in an immediate permanent ban.",
  },
  {
    tag: "BAN",
    title: "Automated Scanning",
    body: "Running vulnerability scanners without explicit permission. Manual testing only unless a program says otherwise.",
  },
];

export default function HomePage() {
  const toneClass: Record<(typeof TERMINAL_LINES)[number]["tone"], string> = {
    cmd: "text-zinc-100",
    ok: "text-emerald-400",
    warn: "text-amber-400",
    crit: "text-red-400 font-bold",
    dim: "text-zinc-500",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/jahez-logo.webp"
              alt="Jahez Group"
              width={100}
              height={32}
              className="h-7 w-auto invert"
              priority
            />
            <div className="h-5 w-px bg-border" />
            <span className="font-mono text-sm tracking-[0.2em] text-primary">SECURITY</span>
          </Link>

          <nav className="hidden items-center gap-6 font-mono text-xs text-muted-foreground md:flex">
            <Link href="/programs" className="transition-colors hover:text-primary">
              ./programs
            </Link>
            <Link href="/leaderboard" className="transition-colors hover:text-primary">
              ./hall_of_fame
            </Link>
            <span className="flex items-center gap-2 text-emerald-500/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              online
            </span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="font-mono text-xs text-muted-foreground hover:text-primary sm:text-sm"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-primary font-mono text-xs text-primary-foreground hover:bg-primary/90 sm:text-sm">
                Join Program
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
          />

          <div className="container relative mx-auto px-4 pb-20 pt-16 sm:pt-24 lg:pb-28 lg:pt-28">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              {/* Copy */}
              <div className="lg:col-span-7">
                <h1 className="leading-[0.9] tracking-tight">
                  <span className="block font-mono text-xs uppercase tracking-[0.4em] text-zinc-500 sm:text-sm">
                    Vulnerability Disclosure Program
                  </span>
                  <span className="mt-3 block text-[clamp(2.5rem,7vw,5rem)] font-black uppercase text-zinc-100">
                    Secure
                  </span>
                  <span className="block text-[clamp(2.2rem,6vw,4.5rem)] font-black uppercase text-primary">
                    Jahez Group
                  </span>
                </h1>

                <p className="mt-5 font-mono text-sm text-emerald-400/80">
                  find real bugs. earn points. claim your rank.
                </p>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                  A private, invite-by-merit program for security researchers. No noise, no
                  scanners, no bounties for volume: just skill, recognition, and a spot in the{" "}
                  <Link href="/leaderboard" className="font-mono text-primary underline-offset-4 hover:underline">
                    Hall of Fame
                  </Link>
                  .
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="h-11 w-full gap-2 bg-primary px-6 font-mono text-sm text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    >
                      <Crosshair className="h-4 w-4" />
                      Start Hunting
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/programs">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-11 w-full gap-2 border-primary/30 bg-transparent px-6 font-mono text-sm text-primary hover:border-primary/60 hover:bg-primary/10 sm:w-auto"
                    >
                      <Bug className="h-4 w-4" />
                      View Targets
                    </Button>
                  </Link>
                </div>

                <dl className="mt-8 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800/80 font-mono">
                  {[
                    { k: "max_points", v: "100", sub: "per P1" },
                    { k: "severities", v: "05", sub: "P1 - P5" },
                    { k: "access", v: "PRIV", sub: "invite" },
                  ].map((s) => (
                    <div key={s.k} className="bg-zinc-950/80 px-3 py-3 sm:px-4">
                      <dt className="text-[10px] uppercase tracking-widest text-zinc-500">{s.k}</dt>
                      <dd className="mt-1 text-lg font-bold text-emerald-400 sm:text-xl">{s.v}</dd>
                      <dd className="text-[10px] text-zinc-600">{s.sub}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Terminal demo */}
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                  <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
                    <span className="font-mono text-[11px] text-zinc-400">
                      hunt.log
                    </span>
                  </div>
                  <div className="space-y-1.5 p-4 font-mono text-[11px] leading-relaxed sm:p-5 sm:text-xs">
                    {TERMINAL_LINES.map((line, i) => (
                      <div
                        key={line.text}
                        className={`flex gap-2 ${toneClass[line.tone]}`}
                      >
                        <span className="w-5 shrink-0 select-none text-right text-zinc-700">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="break-all">{line.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-center font-mono text-[10px] text-zinc-600">
                  simulated session
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="border-t border-zinc-800/80">
          <div className="container mx-auto px-4 py-16 sm:py-20">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                How It Works
              </h2>
              <p className="font-mono text-xs text-zinc-500">no shortcuts. no scanners. no excuses.</p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-3xl font-black text-zinc-800">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-50">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= POINTS & RECOGNITION ================= */}
        <section className="border-t border-zinc-800/80">
          <div className="container mx-auto px-4 py-16 sm:py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Points */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  <Trophy className="-mt-1 mr-2 inline h-6 w-6 text-primary" />
                  Points System
                </h2>
                <p className="mt-2 font-mono text-xs text-zinc-500">
                  no money changes hands. higher severity = more points.
                </p>

                <div className="mt-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                  <ul className="divide-y divide-zinc-800/70">
                    {SEVERITIES.map((s) => (
                      <li
                        key={s.code}
                        className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 px-4 py-3 font-mono sm:px-5"
                      >
                        <span className={`text-base font-black ${s.code === "P1" ? "text-red-400" : s.code === "P2" ? "text-orange-400" : s.code === "P3" ? "text-yellow-400" : s.code === "P4" ? "text-emerald-400" : "text-sky-400"}`}>{s.code}</span>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300">{s.name}</span>
                          </div>
                          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-zinc-800/80">
                            <div
                              className={`h-full rounded-full ${s.code === "P1" ? "bg-red-500" : s.code === "P2" ? "bg-orange-500" : s.code === "P3" ? "bg-yellow-500" : s.code === "P4" ? "bg-emerald-500" : "bg-sky-500"} opacity-60`}
                              style={{ width: `${s.pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-right text-sm font-bold text-zinc-100">
                          +{s.pts}
                          <span className="ml-1 text-[10px] font-normal text-zinc-500">pts</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 font-mono text-[10px] text-zinc-500 sm:px-5">
                    <span className="text-red-400">spam -25</span>
                    <span className="text-red-400">out_of_scope -10</span>
                    <span className="ml-auto">points never go below 0</span>
                  </div>
                </div>
              </div>

              {/* Recognition */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  <Award className="-mt-1 mr-2 inline h-6 w-6 text-primary" />
                  Recognition
                </h2>
                <p className="mt-2 font-mono text-xs text-zinc-500">prove yourself. get seen.</p>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      icon: Crown,
                      title: "Hall of Fame",
                      body: "Top researchers are featured on the public leaderboard. Climb the ranks: n00b, h4ck3r, 1337.",
                      tone: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
                      href: "/leaderboard",
                    },
                    {
                      icon: Flame,
                      title: "Badges & Achievements",
                      body: "Bug Slayer, Cyber Ninja, Exploit King, 0day Hunter, Scope Destroyer. Earn badges as you hit point milestones.",
                      tone: "text-amber-400 border-amber-500/30 bg-amber-500/10",
                    },
                    {
                      icon: Shield,
                      title: "Certificates",
                      body: "Top performers receive official certificates of appreciation from Jahez Group Security.",
                      tone: "text-sky-400 border-sky-500/30 bg-sky-500/10",
                    },
                  ].map((r) => {
                    const inner = (
                      <div className="group flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${r.tone}`}
                        >
                          <r.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="flex items-center gap-2 font-semibold text-zinc-50">
                            {r.title}
                            {r.href && (
                              <ChevronRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-emerald-400" />
                            )}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{r.body}</p>
                        </div>
                      </div>
                    );
                    return r.href ? (
                      <Link key={r.title} href={r.href} className="block">
                        {inner}
                      </Link>
                    ) : (
                      <div key={r.title}>{inner}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RULES OF ENGAGEMENT ================= */}
        <section className="border-t border-zinc-800/80">
          <div className="container mx-auto px-4 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl">
              <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
                <div className="border-b border-zinc-800 px-5 py-3">
                  <div className="flex items-center gap-2 font-mono text-sm text-zinc-300">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="uppercase tracking-wider">Rules of Engagement</span>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <p className="text-sm text-zinc-400">
                    We take quality seriously. The following actions result in point deductions
                    or a ban. There are no appeals for form abuse.
                  </p>

                  <div className="h-px bg-zinc-800" />

                  <ul className="space-y-3">
                    {PENALTIES.map((p) => (
                      <li
                        key={p.title}
                        className="flex items-start gap-3 px-1 py-1"
                      >
                        <span className="mt-0.5 shrink-0 rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-red-400">
                          {p.tag}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{p.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{p.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="h-px bg-zinc-800" />

                  <p className="font-mono text-xs text-emerald-400">
                    Quality reports only. We reward skill, not volume.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="border-t border-zinc-800/80">
          <div className="container mx-auto px-4 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <Fingerprint className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Ready to join?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Register, pick a target, find a real bug, and earn your rank. The board is
                waiting for a new name.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/auth/register">
                  <Button className="h-11 w-full gap-2 bg-primary px-6 font-mono text-primary-foreground hover:bg-primary/90 sm:w-auto">
                    Register Now
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button
                    variant="outline"
                    className="h-11 w-full gap-2 border-zinc-700 bg-transparent px-6 font-mono text-zinc-300 hover:border-zinc-600 sm:w-auto"
                  >
                    See the Board
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative border-t border-zinc-800/80 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/jahez-logo.webp"
              alt="Jahez Group"
              width={80}
              height={24}
              className="h-5 w-auto invert opacity-50"
            />
            <span className="h-4 w-px bg-zinc-800" />
            <span className="font-mono text-xs">security program</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-600">&copy; {new Date().getFullYear()} Jahez Group</span>
        </div>
      </footer>
    </div>
  );
}