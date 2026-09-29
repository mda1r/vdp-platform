export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRank, getEarnedBadges } from "@/lib/ranks";

const PODIUM = [
  {
    order: "md:order-2",
    lift: "md:-translate-y-4",
    icon: <Crown className="h-5 w-5 text-emerald-400" />,
    ring: "ring-emerald-500/50",
    card: "border-emerald-500/30 bg-zinc-900/80",
    accent: "text-emerald-400",
    line: "from-transparent via-emerald-500/60 to-transparent",
  },
  {
    order: "md:order-1",
    lift: "",
    icon: <Medal className="h-5 w-5 text-zinc-400" />,
    ring: "ring-zinc-500/40",
    card: "border-zinc-700/60 bg-zinc-900/60",
    accent: "text-zinc-300",
    line: "from-transparent via-zinc-500/40 to-transparent",
  },
  {
    order: "md:order-3",
    lift: "",
    icon: <Award className="h-5 w-5 text-amber-500" />,
    ring: "ring-amber-500/40",
    card: "border-amber-700/40 bg-zinc-900/60",
    accent: "text-amber-400",
    line: "from-transparent via-amber-500/40 to-transparent",
  },
];

const RANK_ICONS = [
  <Crown key="1" className="h-3.5 w-3.5 text-emerald-400" />,
  <Medal key="2" className="h-3.5 w-3.5 text-zinc-400" />,
  <Award key="3" className="h-3.5 w-3.5 text-amber-500" />,
];

export default async function LeaderboardPage() {
  const researchers = await db.user.findMany({
    where: { role: "RESEARCHER", isActive: true, isBanned: false },
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
    },
    orderBy: { points: "desc" },
    take: 100,
  });

  const topPoints = researchers[0]?.points ?? 0;
  const podiumCount = Math.min(3, researchers.length);
  const podiumGrid =
    podiumCount === 3
      ? "md:grid-cols-3"
      : podiumCount === 2
        ? "md:mx-auto md:max-w-2xl md:grid-cols-2"
        : "md:mx-auto md:max-w-sm md:grid-cols-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Hall of Fame
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Top security researchers ranked by points
        </p>
        <div className="mt-3 flex items-center gap-4 font-mono text-xs text-zinc-500">
          <span>{researchers.length} researchers</span>
          <span>top score: {topPoints.toLocaleString()} pts</span>
        </div>
      </div>

        {/* Podium */}
        {researchers.length > 0 && (
          <div className={`mb-10 grid gap-4 md:items-end md:pt-4 ${podiumGrid}`}>
            {researchers.slice(0, 3).map((r, i) => {
              const p = PODIUM[i];
              const isFirst = i === 0;
              const rank = getRank(r.points);
              const badges = getEarnedBadges(r.points);
              const layout = podiumCount === 3 ? `${p.order} ${p.lift}` : "";
              return (
                <Card
                  key={r.id}
                  className={`relative overflow-hidden border transition-all duration-300 ${p.card} ${layout}`}
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${p.line}`}
                  />

                  <div className="absolute right-3 top-3">{p.icon}</div>

                  <CardContent className="flex flex-col items-center pt-8 pb-6 text-center">
                    {/* Clean rank number */}
                    <span className={`mb-2 font-mono text-xs font-bold ${p.accent}`}>
                      #{i + 1}
                    </span>

                    <div className={`rounded-full p-0.5 ring-2 ${p.ring}`}>
                      <Avatar className={isFirst ? "h-20 w-20" : "h-16 w-16"}>
                        <AvatarImage src={r.image ?? undefined} />
                        <AvatarFallback
                          className={`bg-zinc-800 font-mono font-semibold text-zinc-100 ${
                            isFirst ? "text-xl" : "text-lg"
                          }`}
                        >
                          {r.name?.[0]?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <Link
                      href={`/profile/${r.id}`}
                      className={`mt-3 font-semibold text-zinc-100 transition-colors hover:text-emerald-300 ${
                        isFirst ? "text-lg" : "text-base"
                      }`}
                    >
                      {r.name}
                    </Link>

                    {/* Rank tag */}
                    <span className={`mt-1 inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${rank.color} ${rank.borderColor} ${rank.bgColor}`}>
                      {rank.tag}
                    </span>

                    <p className={`mt-2 font-mono text-2xl font-bold tabular-nums ${p.accent}`}>
                      {r.points.toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-zinc-600">pts</span>
                    </p>

                    {/* Earned badges */}
                    {badges.length > 0 && (
                      <div className="mt-3 flex flex-wrap justify-center gap-1">
                        {badges.slice(-3).map((b) => (
                          <span
                            key={b.tag}
                            title={b.description}
                            className="rounded border border-zinc-700/60 bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400"
                          >
                            {b.label}
                          </span>
                        ))}
                        {badges.length > 3 && (
                          <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] text-zinc-600">
                            +{badges.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <Card className="overflow-hidden border border-zinc-800 bg-zinc-900/50">
          <CardHeader className="border-b border-zinc-800 pb-3">
            <CardTitle className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-zinc-300">
              <Users className="h-4 w-4 text-emerald-500" />
              All Researchers
              <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-zinc-600">
                top 100
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table className="font-mono text-xs sm:text-sm">
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="w-16 px-4 text-[10px] uppercase tracking-widest text-zinc-600">
                    #
                  </TableHead>
                  <TableHead className="px-4 text-[10px] uppercase tracking-widest text-zinc-600">
                    researcher
                  </TableHead>
                  <TableHead className="hidden px-4 text-[10px] uppercase tracking-widest text-zinc-600 md:table-cell">
                    rank
                  </TableHead>
                  <TableHead className="hidden px-4 text-[10px] uppercase tracking-widest text-zinc-600 lg:table-cell">
                    badges
                  </TableHead>
                  <TableHead className="px-4 text-right text-[10px] uppercase tracking-widest text-zinc-600">
                    points
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {researchers.map((r, i) => {
                  const pct = topPoints > 0 ? Math.round((r.points / topPoints) * 100) : 0;
                  const isTop3 = i < 3;
                  const rank = getRank(r.points);
                  const badges = getEarnedBadges(r.points);
                  return (
                    <TableRow
                      key={r.id}
                      className={`group border-zinc-800/60 transition-colors hover:bg-emerald-500/[0.03] ${
                        i === 0 ? "bg-emerald-500/[0.04]" : ""
                      }`}
                    >
                      <TableCell className="px-4">
                        <div className="flex items-center gap-1.5">
                          {isTop3 ? RANK_ICONS[i] : <span className="inline-block w-3.5" />}
                          <span className={`tabular-nums ${i === 0 ? "font-bold text-emerald-400" : isTop3 ? "font-semibold text-zinc-300" : "text-zinc-500"}`}>
                            {(i + 1).toString().padStart(2, "0")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <Link
                          href={`/profile/${r.id}`}
                          className="flex items-center gap-2.5 text-zinc-200 transition-colors hover:text-emerald-300"
                        >
                          <Avatar className={`h-7 w-7 ring-1 ${i === 0 ? "ring-emerald-500/50" : "ring-zinc-700"}`}>
                            <AvatarImage src={r.image ?? undefined} />
                            <AvatarFallback className="bg-zinc-800 font-mono text-xs text-zinc-300">
                              {r.name?.[0]?.toUpperCase() ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{r.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden px-4 md:table-cell">
                        <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${rank.color} ${rank.borderColor} ${rank.bgColor}`}>
                          {rank.tag}
                        </span>
                      </TableCell>
                      <TableCell className="hidden px-4 lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {badges.length === 0 ? (
                            <span className="text-zinc-700">--</span>
                          ) : (
                            <>
                              {badges.slice(-2).map((b) => (
                                <span
                                  key={b.tag}
                                  title={b.description}
                                  className="rounded border border-zinc-700/50 bg-zinc-800/40 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                                >
                                  {b.label}
                                </span>
                              ))}
                              {badges.length > 2 && (
                                <span className="text-[10px] text-zinc-600">+{badges.length - 2}</span>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`font-semibold tabular-nums ${i === 0 ? "text-emerald-400" : "text-zinc-200"}`}>
                            {r.points.toLocaleString()}
                          </span>
                          <div className="h-0.5 w-16 overflow-hidden rounded bg-zinc-800">
                            <div
                              className="h-full bg-emerald-500/60 transition-all group-hover:bg-emerald-400/80"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {researchers.length === 0 && (
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableCell colSpan={5} className="py-12 text-center font-mono text-zinc-600">
                      <span className="text-emerald-500">$</span> no researchers on the board yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      <p className="mt-4 text-center font-mono text-[10px] text-zinc-600">
        points are awarded for accepted reports &middot; spam &amp; out-of-scope deduct points
      </p>
    </div>
  );
}
