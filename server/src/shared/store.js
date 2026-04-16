import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DB_PATH = path.resolve(process.cwd(), "data", "db.json");

async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { _meta: { createdAt: new Date().toISOString() } };
  }
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function ensureArray(db, key) {
  if (!Array.isArray(db[key])) db[key] = [];
  return db[key];
}

export const store = {
  async getAll(key) {
    const db = await readDb();
    return ensureArray(db, key);
  },
  async getById(key, id) {
    const db = await readDb();
    const arr = ensureArray(db, key);
    return arr.find((x) => String(x.id) === String(id)) || null;
  },
  async create(key, input) {
    const db = await readDb();
    const arr = ensureArray(db, key);
    const row = { ...input };
    if (!row.id) row.id = randomUUID();
    arr.unshift(row);
    await writeDb(db);
    return row;
  },
  async update(key, id, input) {
    const db = await readDb();
    const arr = ensureArray(db, key);
    const idx = arr.findIndex((x) => String(x.id) === String(id));
    if (idx < 0) return null;
    arr[idx] = { ...arr[idx], ...input, id: arr[idx].id };
    await writeDb(db);
    return arr[idx];
  },
  async remove(key, id) {
    const db = await readDb();
    const arr = ensureArray(db, key);
    const before = arr.length;
    db[key] = arr.filter((x) => String(x.id) !== String(id));
    if (db[key].length === before) return false;
    await writeDb(db);
    return true;
  },
};

