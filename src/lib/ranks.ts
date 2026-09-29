export type Rank = {
  tag: string;
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
};

const RANKS: Rank[] = [
  {
    tag: "1337",
    label: "1337",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
  },
  {
    tag: "h4ck3r",
    label: "h4ck3r",
    color: "text-sky-400",
    borderColor: "border-sky-500/30",
    bgColor: "bg-sky-500/10",
  },
  {
    tag: "n00b",
    label: "n00b",
    color: "text-zinc-500",
    borderColor: "border-zinc-700",
    bgColor: "bg-zinc-800/50",
  },
];

export function getRank(points: number): Rank {
  if (points >= 500) return RANKS[0]; // 1337
  if (points >= 200) return RANKS[1]; // h4ck3r
  return RANKS[2]; // n00b
}

export type BadgeDef = {
  tag: string;
  label: string;
  threshold: number;
  description: string;
};

export const BADGE_MILESTONES: BadgeDef[] = [
  { tag: "first_blood", label: "First Blood", threshold: 0, description: "First accepted report" },
  { tag: "bug_whisperer", label: "Bug Whisperer", threshold: 25, description: "The bugs talk to you" },
  { tag: "recon_master", label: "Recon Master", threshold: 50, description: "Elite recon skills" },
  { tag: "bug_slayer", label: "Bug Slayer", threshold: 100, description: "Clean find after clean find" },
  { tag: "critical_finder", label: "Critical Finder", threshold: 150, description: "Surgical exploit precision" },
  { tag: "cyber_ninja", label: "Cyber Ninja", threshold: 200, description: "Built different" },
  { tag: "chain_master", label: "Chain Master", threshold: 300, description: "Insane chain linking" },
  { tag: "security_wizard", label: "Security Wizard", threshold: 400, description: "Galaxy brain finds" },
  { tag: "exploit_king", label: "Exploit King", threshold: 500, description: "You own this program" },
  { tag: "0day_hunter", label: "0day Hunter", threshold: 750, description: "Top tier hunter" },
  { tag: "scope_destroyer", label: "Scope Destroyer", threshold: 1000, description: "Absolute legend" },
  { tag: "hall_of_famer", label: "Hall of Famer", threshold: 1500, description: "Goated hunter" },
];

export function getEarnedBadges(points: number): BadgeDef[] {
  return BADGE_MILESTONES.filter((b) => points >= b.threshold);
}

export function getNextBadge(points: number): BadgeDef | null {
  return BADGE_MILESTONES.find((b) => points < b.threshold) ?? null;
}
