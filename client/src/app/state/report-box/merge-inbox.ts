import type { ReportBoxReport } from "@/types/ems";

export function mergeInboxReports(
  prev: ReportBoxReport[],
  hydrated: ReportBoxReport[],
) {
  const incomingById = new Map(hydrated.map((r) => [r.id, r]));

  const next: ReportBoxReport[] = prev.map((localReport) => {
    const incoming = incomingById.get(localReport.id);
    if (!incoming) return localReport;

    const localByMessageId = new Map(
      localReport.messages.map((m) => [m.id, m]),
    );

    const mergedMessages = incoming.messages.map((incomingMessage) => {
      const localMessage = localByMessageId.get(incomingMessage.id);
      if (!localMessage) return incomingMessage;
      return {
        ...incomingMessage,
        text: localMessage.text || incomingMessage.text,
        attachment:
          localMessage.attachment?.dataUrl || localMessage.attachment?.url
            ? localMessage.attachment
            : incomingMessage.attachment,
        durationSec: localMessage.durationSec ?? incomingMessage.durationSec,
      };
    });

    return {
      ...incoming,
      flagged: localReport.flagged,
      status: localReport.status,
      subject: localReport.subject,
      category: localReport.category,
      assignedTo: localReport.assignedTo,
      handledAt: localReport.handledAt,
      handledBy: localReport.handledBy,
      messages: mergedMessages,
    };
  });

  const existing = new Set(prev.map((r) => r.id));
  for (const r of hydrated) {
    if (!existing.has(r.id)) next.push(r);
  }

  next.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return next;
}

