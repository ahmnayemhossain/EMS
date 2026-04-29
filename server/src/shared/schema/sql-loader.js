import { readFile } from "node:fs/promises";

const sqlCache = new Map();

export async function runSchemaSql(fileName, query) {
  const sql = await loadSql(fileName);
  await query(sql);
}

async function loadSql(fileName) {
  if (!sqlCache.has(fileName)) {
    const path = new URL(`./sql/${fileName}`, import.meta.url);
    const content = await readFile(path, "utf8");
    sqlCache.set(fileName, content);
  }
  return sqlCache.get(fileName);
}
