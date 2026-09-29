"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  Bug,
  FolderOpen,
  Trophy,
  Settings,
  LogOut,
  User,
  Menu,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Role-based navigation links                                       */
/* ------------------------------------------------------------------ */

const researcherLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programs", label: "Programs", icon: FolderOpen },
  { href: "/reports", label: "My Reports", icon: Bug },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const adminLinks = [
  { href: "/admin", label: "Admin Panel", icon: Shield },
  { href: "/programs", label: "Programs", icon: FolderOpen },
  { href: "/reports", label: "Reports", icon: Bug },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

function getLinks(role: string) {
  switch (role) {
    case "ADMIN":
      return adminLinks;
    default:
      return researcherLinks;
  }
}

/* ------------------------------------------------------------------ */
/*  Role badge label                                                  */
/* ------------------------------------------------------------------ */

function roleBadgeLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "ADMIN";
    case "COMPANY":
      return "COMPANY";
    default:
      return "RESEARCHER";
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "RESEARCHER";
  const links = getLinks(role);

  /* ---- shared nav link list ---- */
  const NavContent = () => (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/dashboard" && link.href !== "/admin" && pathname.startsWith(link.href)) ||
          (link.href === "/admin" && pathname.startsWith("/admin"));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-mono transition-all duration-200 ${
              isActive
                ? "border-l-2 border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.06),0_0_12px_rgba(16,185,129,0.1)] glow-emerald"
                : "border-l-2 border-transparent text-zinc-500 hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-zinc-300 hover:shadow-[0_0_8px_rgba(16,185,129,0.06)]"
            }`}
          >
            <link.icon
              className={`h-4 w-4 transition-colors duration-200 ${
                isActive
                  ? "text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
                  : "text-zinc-600 group-hover:text-emerald-500/70"
              }`}
            />
            <span className="relative">
              {link.label}
              {isActive && (
                <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-emerald-400/60 to-transparent" />
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  /* ---- sidebar user footer ---- */
  const UserFooter = () => (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
        <AvatarImage src={session?.user?.image ?? undefined} />
        <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
          {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-mono text-zinc-300 truncate">
          {session?.user?.name ?? "Operator"}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-emerald-500/70">
          <span className="h-1 w-1 rounded-full bg-emerald-500/50" />
          {roleBadgeLabel(role)}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ================================================================ */}
      {/*  Desktop sidebar                                                 */}
      {/* ================================================================ */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800/80 bg-zinc-950 lg:block">
        <div className="flex h-full flex-col">
          {/* Gradient glow line at the very top */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />

          {/* Terminal-style titlebar header */}
          <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-5 bg-zinc-950/80">
            {/* Terminal window dots */}
            <div className="flex items-center gap-1.5 mr-1">
              <span className="h-2 w-2 rounded-full bg-red-500/60" />
              <span className="h-2 w-2 rounded-full bg-amber-500/60" />
              <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
            </div>
            <img
              src="/jahez-logo.webp"
              alt="Jahez Group"
              className="h-6 w-auto invert opacity-90"
            />
            <div className="h-4 w-px bg-zinc-700/60" />
            <span className="text-xs font-mono text-emerald-400 tracking-[0.2em] font-bold text-glow">
              SEC
            </span>
          </div>

          {/* Navigation links */}
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-3 px-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-600">
                Navigation
              </span>
            </div>
            <NavContent />
          </div>

          {/* User footer */}
          <div className="border-t border-zinc-800/80 px-4 py-3">
            <UserFooter />
          </div>

          {/* System status footer */}
          <div className="border-t border-zinc-800/60 px-4 py-3 bg-zinc-950/50">
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <Terminal className="h-3 w-3 text-emerald-500/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span className="uppercase tracking-[0.15em] text-emerald-500/50">
                System Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/*  Mobile header                                                   */}
      {/* ================================================================ */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-4 lg:hidden">
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-800/60 hover:text-emerald-400 h-9 w-9 border border-zinc-800/60">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-zinc-950 border-r border-zinc-800/80">
              {/* Sheet glow line */}
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />
              <div className="p-4">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 mr-1">
                    <span className="h-2 w-2 rounded-full bg-red-500/60" />
                    <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                  </div>
                  <img
                    src="/jahez-logo.webp"
                    alt="Jahez Group"
                    className="h-6 w-auto invert opacity-90"
                  />
                  <span className="text-xs font-mono text-emerald-400 tracking-[0.2em] font-bold text-glow">
                    SEC
                  </span>
                </div>
                <NavContent />
                <div className="mt-6 pt-4 border-t border-zinc-800/60">
                  <UserFooter />
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/40">
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    <span className="uppercase tracking-[0.15em] text-emerald-500/50">
                      System Online
                    </span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <img
            src="/jahez-logo.webp"
            alt="Jahez Group"
            className="h-5 w-auto invert opacity-90"
          />
          <div className="h-3 w-px bg-zinc-700/50" />
          <span className="text-[10px] font-mono text-emerald-400/70 tracking-[0.2em] font-bold">
            SEC
          </span>
        </div>
      </header>

      {/* ================================================================ */}
      {/*  Desktop top-bar (user dropdown)                                 */}
      {/* ================================================================ */}
      <div className="hidden h-16 items-center justify-end border-b border-zinc-800/80 bg-zinc-950/50 px-6 lg:flex">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 hover:bg-zinc-800/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.08)] h-9 px-3 gap-2 border border-transparent hover:border-zinc-800/80">
            <Avatar className="h-7 w-7 border border-emerald-500/20 shadow-[0_0_6px_rgba(16,185,129,0.1)]">
              <AvatarImage src={session?.user?.image ?? undefined} />
              <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-mono text-zinc-300">
              {session?.user?.name}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 border border-emerald-500/20 rounded px-1.5 py-0.5 bg-emerald-500/5">
              {roleBadgeLabel(role)}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 border-zinc-800 bg-zinc-950 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_1px_rgba(16,185,129,0.1)]"
          >
            <DropdownMenuItem className="hover:bg-emerald-500/5 focus:bg-emerald-500/5">
              <Link
                href="/settings"
                className="flex items-center gap-2 w-full font-mono text-xs text-zinc-400 hover:text-zinc-200"
              >
                <User className="h-4 w-4 text-emerald-500/50" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-emerald-500/5 focus:bg-emerald-500/5">
              <Link
                href="/settings"
                className="flex items-center gap-2 w-full font-mono text-xs text-zinc-400 hover:text-zinc-200"
              >
                <Settings className="h-4 w-4 text-emerald-500/50" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800/60" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 font-mono text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/5 focus:bg-red-500/5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
