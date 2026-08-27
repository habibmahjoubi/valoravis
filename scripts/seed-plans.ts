import "dotenv/config";

async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const plans = [
    { key: "free",     name: "Gratuit",  price: 0,  quota: 50,  maxUsers: 1,   trialDays: 0,  sortOrder: 0 },
    { key: "pro",      name: "Pro",      price: 29, quota: 100, maxUsers: 3,   trialDays: 14, sortOrder: 1 },
    { key: "business", name: "Business", price: 79, quota: 500, maxUsers: 999, trialDays: 14, sortOrder: 2 },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({ where: { key: p.key }, update: p, create: p });
    console.log("upserted plan:", p.key);
  }
  await prisma.$disconnect();
}
main();
