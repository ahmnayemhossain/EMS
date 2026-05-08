import { pool } from "../../../../core/shared/postgres.js";
import { ensureCoreSchema } from "../../../../core/shared/schema.js";

export async function deleteSdsRecord(req, res, next) {
  try {
    await ensureCoreSchema();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const existing = await client.query("SELECT id FROM sds_records WHERE id = $1", [req.params.id]);
      if (!existing.rowCount) return res.status(404).json({ error: "not_found" });
      await client.query("DELETE FROM sds_records WHERE id = $1", [req.params.id]);
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

