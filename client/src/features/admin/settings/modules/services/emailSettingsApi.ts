import { createSystemHeaders, parseSystemResponse } from "@/features/admin/settings/modules/api/system-api";

export type EmailSettings = {
  id: string;
  key: string;
  isActive: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
  recipientEmails: string[];
  subjectTemplate: string;
  htmlTemplate: string;
};

export async function getEmailSettings(userId: string, key: string) {
  const response = await fetch(`/api/system/email-settings/${encodeURIComponent(key)}`, {
    cache: "no-store",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<EmailSettings>(response, "Email settings request failed.");
}

export async function updateEmailSettings(
  userId: string,
  key: string,
  input: Omit<EmailSettings, "id" | "key">,
) {
  const response = await fetch(`/api/system/email-settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(input),
  });
  return parseSystemResponse<EmailSettings>(response, "Email settings request failed.");
}

