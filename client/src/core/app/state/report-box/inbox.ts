import type { ReportBoxMessageKind, ReportBoxReport } from "@/core/types/models/ems";

import { INBOX_INDEX_URL } from "@/core/app/state/report-box/constants";

export type InboxIndexItem = {
  id: string;
  createdAt: string;
  companyId?: string;
  subject: string;
  reportFile?: string; // relative to /report-box/inbox/
  flagged?: boolean;
  status?: ReportBoxReport["status"];
  assignedTo?: string;
};

async function loadTextFile(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return undefined;
  return await res.text();
}

export async function loadInboxIndex(): Promise<InboxIndexItem[]> {
  const res = await fetch(INBOX_INDEX_URL, { cache: "no-store" });
  if (!res.ok) return [];
  const parsed = (await res.json()) as unknown;
  return Array.isArray(parsed) ? (parsed as InboxIndexItem[]) : [];
}

export async function hydrateInboxReport(
  item: InboxIndexItem,
): Promise<ReportBoxReport> {
  const baseUrl = "/report-box/inbox/";
  const reportUrl = item.reportFile ? `${baseUrl}${item.reportFile}` : undefined;

  let reportDoc: any = null;
  if (reportUrl) {
    try {
      const res = await fetch(reportUrl, { cache: "no-store" });
      if (res.ok) reportDoc = await res.json();
    } catch {
      reportDoc = null;
    }
  }

  const rawMessages = Array.isArray(reportDoc?.messages) ? reportDoc.messages : [];
  const messages = await Promise.all(
    rawMessages.map(async (m: any, index: number) => {
      const kind = (m?.kind as ReportBoxMessageKind) || "text";
      const textUrl = m?.textFile ? `${baseUrl}${m.textFile}` : undefined;
      const mediaUrl = m?.mediaFile ? `${baseUrl}${m.mediaFile}` : undefined;

      const messageText =
        kind === "text" && textUrl ? await loadTextFile(textUrl) : undefined;

      return {
        id: String(m?.id || `${item.id}__m${index + 1}`),
        at: String(m?.at || item.createdAt),
        kind,
        text: messageText?.trim() || undefined,
        durationSec: typeof m?.durationSec === "number" ? m.durationSec : undefined,
        attachment:
          kind === "voice" && mediaUrl
            ? { mime: "audio/*", name: m?.mediaFile, url: mediaUrl }
            : kind === "photo" && mediaUrl
              ? { mime: "image/*", name: m?.mediaFile, url: mediaUrl }
              : undefined,
      };
    }),
  );

  return {
    id: item.id,
    createdAt: item.createdAt,
    facilityId: item.companyId,
    channel: "public",
    origin: "inbox",
    status: item.status ?? "new",
    flagged: Boolean(item.flagged),
    subject: item.subject,
    messages: messages.length ? messages : [],
    assignedTo: item.assignedTo,
  };
}
