import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  Globe,
  ExternalLink,
  Calendar,
  Trophy,
  GitBranch,
  AtSign,
  Bug,
  Award,
  Cpu,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getRank, getEarnedBadges } from "@/lib/ranks";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      name: true,
      image: true,
      bio: true,
      skills: true,
      website: true,
      github: true,
      twitter: true,
      points: true,
      role: true,
      createdAt: true,
      badges: {
        include: {
          badge: true,
        },
      },
      _count: {
        select: {
          reports: {
            where: {
              status: { in: ["ACCEPTED", "RESOLVED", "CLOSED"] },
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== "RESEARCHER") {
    notFound();
  }

  const handle = (user.name || "anonymous").toLowerCase().replace(/\s+/g, "_");
  const rank = getRank(user.points);
  const earnedBadges = getEarnedBadges(user.points);

  const stats = [
    {
      label: "Reputation",
      value: user.points,
      icon: Trophy,
      color: "emerald",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Accepted Reports",
      value: user._count.reports,
      icon: Bug,
      color: "sky",
      bgColor: "bg-sky-500/10",
      textColor: "text-sky-400",
      borderColor: "border-sky-500/20",
    },
    {
      label: "Badges",
      value: earnedBadges.length,
      icon: Award,
      color: "amber",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          href="/leaderboard"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        {/* Identity Card */}
        <Card className="bg-zinc-900/60 border-zinc-800/80 overflow-hidden">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <Avatar className="h-24 w-24 border-2 border-emerald-500/30">
                  <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                  <AvatarFallback className="bg-zinc-800 text-emerald-400 text-2xl font-mono">
                    {(user.name || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Verification dot */}
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center">
                  <ShieldCheck className="h-2.5 w-2.5 text-zinc-900" />
                </span>
              </div>

              {/* Name and role */}
              <h1 className="text-2xl font-bold text-zinc-100 mb-1">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Researcher
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${rank.bgColor} ${rank.color} ${rank.borderColor} border`}>
                  {rank.tag}
                </span>
              </div>

              {/* Handle */}
              <p className="text-zinc-500 font-mono text-sm mb-4">@{handle}</p>

              {/* Bio */}
              {user.bio && (
                <p className="text-zinc-400 text-sm max-w-md mb-4 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Join date */}
              <div className="flex items-center gap-1.5 text-zinc-600 text-xs font-mono mb-6">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {format(new Date(user.createdAt), "MMMM yyyy")}</span>
              </div>

              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700/50 bg-zinc-800/50 text-zinc-300 text-sm font-mono hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="max-w-[160px] truncate">
                      {user.website.replace(/^https?:\/\//, "")}
                    </span>
                    <ExternalLink className="h-3 w-3 text-zinc-500" />
                  </a>
                )}
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700/50 bg-zinc-800/50 text-zinc-300 text-sm font-mono hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    <span>@{user.github}</span>
                    <ExternalLink className="h-3 w-3 text-zinc-500" />
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700/50 bg-zinc-800/50 text-zinc-300 text-sm font-mono hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
                  >
                    <AtSign className="h-3.5 w-3.5" />
                    <span>@{user.twitter}</span>
                    <ExternalLink className="h-3 w-3 text-zinc-500" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={`bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm`}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-500 text-sm font-mono">
                    {stat.label}
                  </span>
                  <div
                    className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold font-mono ${stat.textColor}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skills section */}
        {user.skills && user.skills.length > 0 && (
          <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm mt-6">
            <CardHeader className="border-b border-zinc-800/60 pb-4">
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
                <Cpu className="h-4 w-4 text-emerald-500" />
                <span>SKILLS &amp; EXPERTISE</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-sm font-mono hover:border-emerald-500/40 hover:bg-emerald-950/30 transition-colors cursor-default"
                  >
                    <span className="text-emerald-600 mr-1.5">#</span>
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badges / Achievements */}
        {earnedBadges.length > 0 && (
          <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm mt-6">
            <CardHeader className="border-b border-zinc-800/60 pb-4">
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
                <Award className="h-4 w-4 text-amber-500" />
                <span>ACHIEVEMENTS</span>
                <span className="ml-auto text-[10px] text-zinc-600">{earnedBadges.length} unlocked</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.tag}
                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800/60 bg-zinc-800/20 hover:border-emerald-500/20 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-zinc-200 font-semibold text-sm font-mono">
                        {badge.label}
                      </h3>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {badge.description} &middot; {badge.threshold}+ pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
