import { query } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";

import { rowToSdsRecord } from "./map.js";
import { selectSdsSql } from "./sql.js";

export async function listSdsRecords(_req, res, next) {
  try {
    await ensureCoreSchema();
    const result = await query(`${selectSdsSql} ORDER BY sr.revision_date DESC, sr.chemical_name ASC`);
    res.json(result.rows.map(rowToSdsRecord));
  } catch (error) {
    next(error);
  }
}

