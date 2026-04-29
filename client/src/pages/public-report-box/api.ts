export async function submitToInbox(input: any) {
  try {
    const response = await fetch("/api/report-box/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await response.json().catch(() => null)) as any;
    if (!response.ok || !data || !data.ok) return { ok: false as const };
    return { ok: true as const, reportId: typeof data.reportId === "string" ? data.reportId : undefined, messageId: typeof data.messageId === "string" ? data.messageId : undefined };
  } catch {
    return { ok: false as const };
  }
}

export async function editInboxMessage(input: { reportId: string; messageId: string; text: string }) {
  return mutateMessage("/api/report-box/message/edit", input);
}

export async function deleteInboxMessage(input: { reportId: string; messageId: string }) {
  return mutateMessage("/api/report-box/message/delete", input);
}

async function mutateMessage(url: string, input: object) {
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const data = (await response.json().catch(() => null)) as any;
    return Boolean(response.ok && data && data.ok);
  } catch {
    return false;
  }
}
