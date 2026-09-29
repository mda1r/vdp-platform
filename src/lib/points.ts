import { db } from "@/lib/db";
import { Priority } from "@prisma/client";

const POINTS_MAP: Record<Priority, number> = {
  P1_CRITICAL: 100,
  P2_HIGH: 50,
  P3_MEDIUM: 25,
  P4_LOW: 10,
  P5_INFO: 5,
};

export function getPointsForPriority(priority: Priority): number {
  return POINTS_MAP[priority] ?? 0;
}

const PENALTY_MAP: Record<string, number> = {
  SPAM: -25,
  OUT_OF_SCOPE: -10,
};

export function getPenaltyForStatus(status: string): number {
  return PENALTY_MAP[status] ?? 0;
}

export async function deductPoints(userId: string, amount: number) {
  if (amount >= 0) return;
  const user = await db.user.findUnique({ where: { id: userId }, select: { points: true } });
  if (!user) return;
  const newPoints = Math.max(0, user.points + amount);
  await db.user.update({
    where: { id: userId },
    data: { points: newPoints },
  });
  return amount;
}

export async function awardPoints(userId: string, priority: Priority) {
  const points = getPointsForPriority(priority);
  if (points === 0) return;

  await db.user.update({
    where: { id: userId },
    data: { points: { increment: points } },
  });

  return points;
}

export async function checkAndAwardBadges(userId: string) {
  const reportCount = await db.report.count({
    where: {
      researcherId: userId,
      status: { in: ["ACCEPTED", "RESOLVED", "CLOSED"] },
    },
  });

  const criticalCount = await db.report.count({
    where: {
      researcherId: userId,
      priority: "P1_CRITICAL",
      status: { in: ["ACCEPTED", "RESOLVED", "CLOSED"] },
    },
  });

  const existingBadges = await db.userBadge.findMany({
    where: { userId },
    select: { badge: { select: { slug: true } } },
  });
  const hasBadge = (slug: string) =>
    existingBadges.some((b) => b.badge.slug === slug);

  const toAward: string[] = [];

  if (reportCount >= 1 && !hasBadge("first-blood")) toAward.push("first-blood");
  if (reportCount >= 10 && !hasBadge("bug-hunter")) toAward.push("bug-hunter");
  if (reportCount >= 50 && !hasBadge("veteran")) toAward.push("veteran");
  if (reportCount >= 100 && !hasBadge("legend")) toAward.push("legend");
  if (criticalCount >= 1 && !hasBadge("critical-finder"))
    toAward.push("critical-finder");
  if (criticalCount >= 10 && !hasBadge("critical-master"))
    toAward.push("critical-master");

  for (const slug of toAward) {
    const badge = await db.badge.findUnique({ where: { slug } });
    if (badge) {
      await db.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      await db.notification.create({
        data: {
          userId,
          type: "BADGE_AWARDED",
          title: "New Badge Earned!",
          message: `You earned the "${badge.name}" badge!`,
          link: `/profile`,
        },
      });
    }
  }
}
