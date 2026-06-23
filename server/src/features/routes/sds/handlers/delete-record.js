import { withTransaction } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";

export async function deleteSdsRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const deleted = await withTransaction(async (client) => {
      const existing = await client.query("SELECT id FROM sds_records WHERE id = $1", [req.params.id]);
      if (!existing.rowCount) return false;
      await client.query("DELETE FROM sds_records WHERE id = $1", [req.params.id]);
      return true;
    });

    if (!deleted) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}
