import { getEmailSettingsByKey, LOGIN_LOG_EMAIL_KEY, renderTemplate, toEmailSettings } from "./email-settings.js";
import { sendSmtpEmail } from "./smtp-client.js";

function getClientIp(req) {
  const forwarded = String(req.get("x-forwarded-for") || "").trim();
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function buildVariables({ req, user }) {
  return {
    appName: "Fortis Group EMS",
    userName: user.name || user.username || "",
    username: user.username || "",
    employeeId: user.employeeId ? String(user.employeeId) : "",
    userEmail: user.email || "",
    loginAt: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Dhaka" }),
    ipAddress: getClientIp(req),
  };
}

export async function sendLoginLogEmail({ req, user }) {
  const row = await getEmailSettingsByKey(LOGIN_LOG_EMAIL_KEY);
  if (!row) return;

  const settings = toEmailSettings(row);
  if (!settings.isActive) return;
  if (!settings.smtpHost || !settings.smtpPort || !settings.fromEmail || !settings.recipientEmails.length) return;

  const variables = buildVariables({ req, user });
  const subject = renderTemplate(settings.subjectTemplate, variables);
  const html = renderTemplate(settings.htmlTemplate, variables);

  await sendSmtpEmail(
    {
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      username: settings.smtpUsername || "",
      password: settings.smtpPassword || "",
      clientName: "fortis-ems",
    },
    {
      fromName: settings.fromName || "",
      fromEmail: settings.fromEmail,
      to: settings.recipientEmails,
      subject,
      html,
    },
  );
}
