import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { normalizeSdsInput } from "./normalize.js";
import { rowToSdsRecord } from "./map.js";
import { selectSdsSql } from "./sql.js";

export async function createSdsRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    const input = normalizeSdsInput(req.body || {});

    const created = await withTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO sds_records (chemical_name, supplier, language, revision_date, file_name, notes, created_by_user_id, updated_by_user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$7) RETURNING id`,
        [input.chemicalName, input.supplier, input.language, input.revisionDate, input.fileName, input.notes, userDbId],
      );
      const sdsId = inserted.rows[0].id;

      for (const sec of input.sections) {
        await client.query(
          `INSERT INTO sds_sections (sds_id, section_no, title, summary) VALUES ($1,$2,$3,$4) ON CONFLICT (sds_id, section_no) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary`,
          [sdsId, Number(sec.id), sec.title, sec.summary],
        );
      }

      return client.query(`${selectSdsSql} WHERE sr.id = $1`, [sdsId]);
    });

    res.status(201).json(rowToSdsRecord(created.rows[0]));
  } catch (error) {
    next(error);
  }
}
