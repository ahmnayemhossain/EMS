import { query } from "./postgres.js";

export function createDependencyError(message) {
  const error = new Error(message);
  error.status = 409;
  return error;
}

export async function countDependency(sql, id) {
  const result = await query(sql, [id]);
  return Number(result.rows[0]?.count || 0);
}

export async function assertDependencyChecks(checks, id, messageBuilder) {
  for (const check of checks) {
    const count = await countDependency(check.sql, id);
    if (count > 0) throw createDependencyError(messageBuilder(check, count));
  }
}
