import "../../env.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalKey = "__emsPrismaClient";
const adapterKey = "__emsPrismaAdapter";

function resolveConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.PGHOST || "localhost";
  const user = process.env.PGUSER || "postgres";
  const password = process.env.PGPASSWORD || "";
  const database = process.env.PGDATABASE || "postgres";
  const port = Number(process.env.PGPORT || 5432);

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function createPrismaAdapter() {
  return new PrismaPg({
    connectionString: resolveConnectionString(),
  });
}

function createPrismaClient() {
  return new PrismaClient({
    adapter:
      globalThis[adapterKey] instanceof PrismaPg
        ? globalThis[adapterKey]
        : createPrismaAdapter(),
    transactionOptions: {
      maxWait: 10_000,
      timeout: 20_000,
    },
  });
}

export const prisma =
  globalThis[globalKey] instanceof PrismaClient
    ? globalThis[globalKey]
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!(globalThis[adapterKey] instanceof PrismaPg)) {
    globalThis[adapterKey] = createPrismaAdapter();
  }
  globalThis[globalKey] = prisma;
}
