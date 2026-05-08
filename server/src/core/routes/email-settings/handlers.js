import { pool } from "../../shared/postgres.js";
import { ensureCoreSchema } from "../../shared/schema.js";
import { getRequestActor, writeAuditLog } from "../../shared/audit-log.js";
import { getEmailSettingsByKey, normalizeEmailSettingsInput, toEmailSettings, validateEmailSettingsInput } from "../../shared/email-settings.js";

export async function getEmailSettings(req, res, next) {
  try {
    await ensureCoreSchema();
    const key = String(req.params.key || "").trim();
    const row = await getEmailSettingsByKey(key);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(toEmailSettings(row));
  } catch (error) {
    next(error);
  }
}

export async function upsertEmailSettings(req, res, next) {
  try {
    await ensureCoreSchema();
    const actor = await getRequestActor(req);
    const input = normalizeEmailSettingsInput({ ...req.body, key: req.params.key });
    validateEmailSettingsInput(input);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const existing = await getEmailSettingsByKey(input.key, client);
      const result = await client.query(
        `
          INSERT INTO email_notification_settings
            (key, is_active, smtp_host, smtp_port, smtp_secure, smtp_username, smtp_password, from_name, from_email, recipient_emails, subject_template, html_template, created_by_user_id, updated_by_user_id)
          VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$13)
          ON CONFLICT (key) DO UPDATE
            SET is_active = EXCLUDED.is_active,
                smtp_host = EXCLUDED.smtp_host,
                smtp_port = EXCLUDED.smtp_port,
                smtp_secure = EXCLUDED.smtp_secure,
                smtp_username = EXCLUDED.smtp_username,
                smtp_password = EXCLUDED.smtp_password,
                from_name = EXCLUDED.from_name,
                from_email = EXCLUDED.from_email,
                recipient_emails = EXCLUDED.recipient_emails,
                subject_template = EXCLUDED.subject_template,
                html_template = EXCLUDED.html_template,
                updated_by_user_id = EXCLUDED.updated_by_user_id,
                updated_at = NOW()
          RETURNING id
        `,
        [
          input.key,
          input.isActive,
          input.smtpHost || null,
          input.smtpPort || null,
          input.smtpSecure,
          input.smtpUsername || null,
          input.smtpPassword || null,
          input.fromName || null,
          input.fromEmail || null,
          JSON.stringify(input.recipientEmails),
          input.subjectTemplate,
          input.htmlTemplate,
          actor.id,
        ],
      );
      const updated = await getEmailSettingsByKey(input.key, client);
      await writeAuditLog(
        {
          tableName: "email_notification_settings",
          rowId: result.rows[0].id,
          action: existing ? "update" : "create",
          actorUserId: actor.id,
          oldData: existing ? toEmailSettings(existing) : null,
          newData: updated ? toEmailSettings(updated) : null,
        },
        client,
      );
      await client.query("COMMIT");
      res.json(toEmailSettings(updated));
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
