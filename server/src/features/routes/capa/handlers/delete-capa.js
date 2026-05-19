import { pool } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";
import { getRequestUserDbId } from "../../utilities/request-context.js";
import { assertUserCompanyAccess } from "../../../modules/utilities/access.js";

import { getCapaById, loadOrderedIds, reorderStatusColumn } from "./shared.js";

export async function deleteCapaRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const userDbId = await getRequestUserDbId(req);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const existing = await getCapaById(client, req.params.id);
      if (!existing) return res.status(404).json({ error: "not_found" });
      await assertUserCompanyAccess(userDbId, Number(existing.facility_id));

      await client.query("DELETE FROM capa_records WHERE id = $1", [req.params.id]);
      const sourceIds = await loadOrderedIds(client, Number(existing.facility_id), existing.status, null);
      await reorderStatusColumn(client, Number(existing.facility_id), existing.status, sourceIds, userDbId);
      await client.query("COMMIT");
      res.json({ ok: true });
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
