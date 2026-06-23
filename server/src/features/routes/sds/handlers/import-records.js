import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";

import { normalizeSdsInput } from "./normalize.js";
import { rowToSdsRecord } from "./map.js";
import { selectSdsSql } from "./sql.js";

export async function importSdsRecords(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);
    const records = Array.isArray(req.body?.records) ? req.body.records : null;

    if (!records?.length) {
      throw createHttpError(400, "Import records are required.");
    }

    const normalizedRecords = records.map((record) => normalizeSdsInput(record));
    const createdRows = await withTransaction(async (client) => {
      const createdRows = [];

      for (const input of normalizedRecords) {
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

        const created = await client.query(`${selectSdsSql} WHERE sr.id = $1`, [sdsId]);
        createdRows.push(rowToSdsRecord(created.rows[0]));
      }

      return createdRows;
    });

    res.status(201).json({ createdCount: createdRows.length, records: createdRows });
  } catch (error) {
    next(error);
  }
}
