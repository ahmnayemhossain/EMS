import "../env.js";
import { pool } from "../core/shared/postgres.js";
import { prisma } from "../core/shared/prisma.js";
import { seedDefaults } from "../core/shared/schema/seed-defaults.js";

async function main() {
  await seedDefaults();
  // eslint-disable-next-line no-console
  console.log("[ems-api] default seed complete");
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("[ems-api] default seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([pool.end(), prisma.$disconnect()]);
  });
