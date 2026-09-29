import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed badges
  const badges = [
    {
      slug: "first-blood",
      name: "First Blood",
      description: "First accepted vulnerability report",
      icon: "🩸",
    },
    {
      slug: "bug-hunter",
      name: "Bug Hunter",
      description: "10 accepted vulnerability reports",
      icon: "🐛",
    },
    {
      slug: "veteran",
      name: "Veteran",
      description: "50 accepted vulnerability reports",
      icon: "⭐",
    },
    {
      slug: "legend",
      name: "Legend",
      description: "100 accepted vulnerability reports",
      icon: "🏆",
    },
    {
      slug: "critical-finder",
      name: "Critical Finder",
      description: "Found a critical vulnerability",
      icon: "🔥",
    },
    {
      slug: "critical-master",
      name: "Critical Master",
      description: "Found 10 critical vulnerabilities",
      icon: "💀",
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {},
      create: badge,
    });
  }

  console.log("Badges seeded");

  // Seed admin user
  const adminEmail = "admin@jahez-sec.local";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123456", 12);
    await prisma.user.create({
      data: {
        name: "Jahez Admin",
        email: adminEmail,
        hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log("Admin user created: admin@jahez-sec.local / Admin@123456");
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
