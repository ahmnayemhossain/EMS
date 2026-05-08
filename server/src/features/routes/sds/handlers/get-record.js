import { query } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";

import { rowToSdsRecord } from "./map.js";
import { selectSdsSql } from "./sql.js";

export async function getSdsRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const result = await query(`${selectSdsSql} WHERE sr.id = $1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    res.json(rowToSdsRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
}

