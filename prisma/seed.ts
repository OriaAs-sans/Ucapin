import { PrismaClient } from "@prisma/client";
import { seedUcapinDatabase } from "../src/server/seed-data";

const prisma = new PrismaClient();

async function main() {
  await seedUcapinDatabase(prisma);
  const [drillCount, scenarioCount, nodeCount] = await Promise.all([
    prisma.drillSentence.count(),
    prisma.scenario.count(),
    prisma.scenarioNode.count(),
  ]);
  console.log(
    `Database Ucapin di Laragon PostgreSQL berhasil di-seed (2 akun testing, 4 tujuan belajar, ${drillCount} kalimat drill, ${scenarioCount} skenario roleplay, ${nodeCount} giliran roleplay, 5 panduan fonem).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
