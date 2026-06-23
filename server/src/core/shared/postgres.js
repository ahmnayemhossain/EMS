import "../../env.js";
import pg from "pg";
import { prisma } from "./prisma.js";

const { Pool } = pg;

pg.types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "postgres",
  port: Number(process.env.PGPORT || 5432),
});

export async function query(text, params) {
  return pool.query(text, params);
}

function readsRows(sql) {
  const normalized = String(sql || "").trim().toLowerCase();
  return (
    normalized.startsWith("select") ||
    normalized.startsWith("with") ||
    normalized.startsWith("show") ||
    normalized.startsWith("explain") ||
    /\breturning\b/.test(normalized)
  );
}

export async function withTransaction(run, options) {
  return prisma.$transaction(async (tx) => {
    const client = {
      query: async (text, params = []) => {
        if (readsRows(text)) {
          const rows = await tx.$queryRawUnsafe(String(text), ...params);
          return {
            rows: Array.isArray(rows) ? rows : [],
            rowCount: Array.isArray(rows) ? rows.length : 0,
          };
        }

        const rowCount = await tx.$executeRawUnsafe(String(text), ...params);
        return {
          rows: [],
          rowCount: Number(rowCount || 0),
        };
      },
    };

    return run(client);
  }, options);
}
