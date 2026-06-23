import { getEmailSettingsByKey, renderTemplate, toEmailSettings } from "./email-settings.js";
import { sendSmtpEmail } from "./smtp-client.js";

export const UTILITY_APPROVAL_EMAIL_KEY = "utility_approval_submission";

function buildVariables(input) {
  return {
    appName: "EMS",
    companyName: input.companyName || "",
    utilityType: input.utilityType || "",
    meterName: input.meterName || "",
    billMonth: input.billMonth || "",
    recordCount: String(input.recordCount || 0),
    totalValue: String(input.totalValue || 0),
    unit: input.unit || "",
    submittedBy: input.submittedBy || "",
    submittedAt: new Date().toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Dhaka",
    }),
  };
}

export async function sendUtilityApprovalSubmissionEmail(input) {
  const row = await getEmailSettingsByKey(UTILITY_APPROVAL_EMAIL_KEY);
  if (!row) return;

  const settings = toEmailSettings(row);
  if (!settings.isActive) return;
  if (!settings.smtpHost || !settings.smtpPort || !settings.fromEmail || !settings.recipientEmails.length) return;

  const variables = buildVariables(input);
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
