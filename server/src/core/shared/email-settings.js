import { query } from "./postgres.js";

export const LOGIN_LOG_EMAIL_KEY = "login_log";
export const UTILITY_APPROVAL_EMAIL_KEY = "utility_approval_submission";

const DEFAULT_SUBJECT = "Login alert: {{userName}}";
const DEFAULT_HTML = "<!doctype html><html><body><h2>Login alert</h2><p><strong>{{userName}}</strong> signed in to {{appName}}.</p><p>Username: {{username}}</p><p>Employee ID: {{employeeId}}</p><p>Email: {{userEmail}}</p><p>Time: {{loginAt}}</p><p>IP: {{ipAddress}}</p></body></html>";
const APPROVAL_SUBJECT = "Utility approval required: {{companyName}} {{utilityType}} {{billMonth}}";
const APPROVAL_HTML = "<!doctype html><html><body><h2>Utility approval required</h2><p><strong>{{companyName}}</strong> submitted utility data for approval.</p><p>Utility type: {{utilityType}}</p><p>Meter: {{meterName}}</p><p>Bill month: {{billMonth}}</p><p>Entries: {{recordCount}}</p><p>Total: {{totalValue}} {{unit}}</p><p>Submitted by: {{submittedBy}}</p><p>Submitted at: {{submittedAt}}</p></body></html>";

export function toEmailSettings(row) {
  const isApproval = row.key === UTILITY_APPROVAL_EMAIL_KEY;
  return {
    id: String(row.id),
    key: row.key,
    isActive: Number(row.is_active) === 1,
    smtpHost: row.smtp_host || "",
    smtpPort: Number(row.smtp_port || 465),
    smtpSecure: Number(row.smtp_secure) === 1,
    smtpUsername: row.smtp_username || "",
    smtpPassword: row.smtp_password || "",
    fromName: row.from_name || "",
    fromEmail: row.from_email || "",
    recipientEmails: Array.isArray(row.recipient_emails) ? row.recipient_emails.map(String) : [],
    subjectTemplate: row.subject_template || (isApproval ? APPROVAL_SUBJECT : DEFAULT_SUBJECT),
    htmlTemplate: row.html_template || (isApproval ? APPROVAL_HTML : DEFAULT_HTML),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getEmailSettingsByKey(key, db = { query }) {
  const result = await db.query(`SELECT * FROM email_notification_settings WHERE key = $1 LIMIT 1`, [key]);
  return result.rows[0] || null;
}

export function normalizeEmailSettingsInput(input) {
  const key = String(input?.key || LOGIN_LOG_EMAIL_KEY).trim() || LOGIN_LOG_EMAIL_KEY;
  const isApproval = key === UTILITY_APPROVAL_EMAIL_KEY;
  const recipientEmails = Array.isArray(input?.recipientEmails)
    ? input.recipientEmails.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)
    : String(input?.recipientEmails || "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

  return {
    key,
    isActive: input?.isActive === true || input?.isActive === 1 ? 1 : 0,
    smtpHost: String(input?.smtpHost || "").trim(),
    smtpPort: Number(input?.smtpPort || 465),
    smtpSecure: input?.smtpSecure === false || input?.smtpSecure === 0 ? 0 : 1,
    smtpUsername: String(input?.smtpUsername || "").trim(),
    smtpPassword: String(input?.smtpPassword || "").trim(),
    fromName: String(input?.fromName || "").trim(),
    fromEmail: String(input?.fromEmail || "").trim().toLowerCase(),
    recipientEmails,
    subjectTemplate: String(input?.subjectTemplate || (isApproval ? APPROVAL_SUBJECT : DEFAULT_SUBJECT)).trim() || (isApproval ? APPROVAL_SUBJECT : DEFAULT_SUBJECT),
    htmlTemplate: String(input?.htmlTemplate || (isApproval ? APPROVAL_HTML : DEFAULT_HTML)).trim() || (isApproval ? APPROVAL_HTML : DEFAULT_HTML),
  };
}

export function validateEmailSettingsInput(input) {
  if (!input.key) throw new Error("Settings key is required.");
  if (input.smtpHost && !input.smtpPort) throw new Error("SMTP port is required.");
  if (input.smtpPort && (!Number.isFinite(input.smtpPort) || input.smtpPort <= 0)) throw new Error("SMTP port must be a positive number.");
  if (input.fromEmail && !isEmail(input.fromEmail)) throw new Error("From email is invalid.");
  for (const email of input.recipientEmails) {
    if (!isEmail(email)) throw new Error(`Recipient email is invalid: ${email}`);
  }
  if (input.isActive) {
    if (!input.smtpHost) throw new Error("SMTP host is required when notification is active.");
    if (!input.fromEmail) throw new Error("From email is required when notification is active.");
    if (!input.recipientEmails.length) throw new Error("At least one recipient email is required when notification is active.");
  }
}

export function renderTemplate(template, variables) {
  return String(template || "").replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => String(variables?.[key] ?? ""));
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}
