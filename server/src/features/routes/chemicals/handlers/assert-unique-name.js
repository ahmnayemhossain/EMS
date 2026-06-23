import { createHttpError } from "../../../modules/utilities/record.js";

export async function assertUniqueChemicalName(client, name, excludeId = null) {
  const result = await client.query(
    `SELECT id FROM chemicals WHERE lower(trim(name)) = lower(trim($1)) AND ($2::bigint IS NULL OR id <> $2::bigint) LIMIT 1`,
    [name, excludeId],
  );

  if (result.rowCount) {
    throw createHttpError(409, "Chemical name must be unique.");
  }
}

export function rethrowChemicalNameConflict(error) {
  if (error?.code === "23505" && String(error?.constraint || "").includes("chemicals_name_unique")) {
    throw createHttpError(409, "Chemical name must be unique.");
  }

  throw error;
}
