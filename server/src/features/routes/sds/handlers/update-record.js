import { pool } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { normalizeSdsInput } from "./normalize.js";
import { rowToSdsRecord } from "./map.js";
import { selectSdsSql } from "./sql.js";

export async function updateSdsRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    const input = normalizeSdsInput(req.body || {});

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const existing = await client.query("SELECT id FROM sds_records WHERE id = $1", [req.params.id]);
      if (!existing.rowCount) return res.status(404).json({ error: "not_found" });

      await client.query(
        `UPDATE sds_records SET chemical_name=$2, supplier=$3, language=$4, revision_date=$5, file_name=$6, notes=$7, updated_by_user_id=$8, updated_at=NOW() WHERE id=$1`,
        [req.params.id, input.chemicalName, input.supplier, input.language, input.revisionDate, input.fileName, input.notes, userDbId],
      );

      for (const sec of input.sections) {
        await client.query(
          `INSERT INTO sds_sections (sds_id, section_no, title, summary) VALUES ($1,$2,$3,$4) ON CONFLICT (sds_id, section_no) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary`,
          [req.params.id, Number(sec.id), sec.title, sec.summary],
        );
      }

      const updated = await client.query(`${selectSdsSql} WHERE sr.id = $1`, [req.params.id]);
      await client.query("COMMIT");
      res.json(rowToSdsRecord(updated.rows[0]));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}

