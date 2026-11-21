import { PrismaClient } from "@prisma/client";
import { seedContent } from "../src/server/seed-data";

// Seed materi saja (aman untuk production): tidak menyentuh pengguna atau riwayat latihan.
const prisma = new PrismaClient();

seedContent(prisma)
  .then(async () => {
    const [drills, scenarios] = await Promise.all([
      prisma.drillSentence.count(),
      prisma.scenario.count(),
    ]);
    console.log(`Materi Ucapin siap: ${drills} kalimat drill, ${scenarios} skenario roleplay.`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
