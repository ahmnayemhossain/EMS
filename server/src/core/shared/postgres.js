import "../../env.js";
import pg from "pg";

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
