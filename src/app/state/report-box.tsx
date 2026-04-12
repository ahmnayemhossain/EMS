import * as React from "react";

import type { ReportBoxAttachment, ReportBoxMessageKind, ReportBoxReport } from "@/types/ems";

type NewReportInput = {
  facilityId?: string;
  subject: string;
  kind: ReportBoxMessageKind;
  text?: string;
  attachment?: ReportBoxAttachment;
  durationSec?: number;
};

type NewMessageInput = {
  kind: ReportBoxMessageKind;
  text?: string;
  attachment?: ReportBoxAttachment;
  durationSec?: number;
};

type ReportBoxContextValue = {
  reports: ReportBoxReport[];
  addReport: (input: NewReportInput) => string;
  toggleFlag: (id: string) => void;
  setStatus: (id: string, status: ReportBoxReport["status"]) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignee?: string) => void;
  addMessage: (id: string, input: NewMessageInput) => void;
  removeReport: (id: string) => void;
  deleteReport: (id: string) => Promise<void>;
  refreshFromInbox: () => Promise<void>;
};

const ReportBoxContext = React.createContext<ReportBoxContextValue | null>(null);

const STORAGE_KEY = "ems:reportBoxReports_v2";
const INBOX_INDEX_URL = "/report-box/inbox/index.json";
const INBOX_DELETE_URL = "/api/report-box/delete";

function nowIso() {
  return new Date().toISOString();
}

function safeParseReports(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as ReportBoxReport[];
  } catch {
    return null;
  }
}

function createId(prefix: string) {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

type InboxIndexItem = {
  id: string;
  createdAt: string;
  factoryId?: string;
  subject: string;
  reportFile?: string; // relative to /report-box/inbox/
  flagged?: boolean;
  status?: ReportBoxReport["status"];
  assignedTo?: string;
};

async function loadInboxIndex(): Promise<InboxIndexItem[]> {
  const res = await fetch(INBOX_INDEX_URL, { cache: "no-store" });
  if (!res.ok) return [];
  const parsed = (await res.json()) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed as InboxIndexItem[];
}

async function loadTextFile(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return undefined;
  return await res.text();
}

async function hydrateInboxReport(item: InboxIndexItem): Promise<ReportBoxReport> {
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

  const msgs = Array.isArray(reportDoc?.messages) ? reportDoc.messages : [];
  const messages = await Promise.all(
    msgs.map(async (m: any, idx: number) => {
      const kind = (m?.kind as ReportBoxMessageKind) || "text";
      const textUrl = m?.textFile ? `${baseUrl}${m.textFile}` : undefined;
      const mediaUrl = m?.mediaFile ? `${baseUrl}${m.mediaFile}` : undefined;
      const messageText = kind === "text" && textUrl ? await loadTextFile(textUrl) : undefined;
      return {
        id: String(m?.id || `${item.id}__m${idx + 1}`),
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
    facilityId: item.factoryId,
    channel: "public",
    origin: "inbox",
    status: item.status ?? "new",
    flagged: Boolean(item.flagged),
    subject: item.subject,
    messages: messages.length ? messages : [],
    assignedTo: item.assignedTo,
  };
}

export function ReportBoxProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = React.useState<ReportBoxReport[]>(() => {
    const saved =
      typeof window !== "undefined"
        ? safeParseReports(window.localStorage.getItem(STORAGE_KEY))
        : null;
    return saved && saved.length ? saved : [];
  });

  const refreshFromInbox = React.useCallback(async () => {
    try {
      const index = await loadInboxIndex();
      if (!index.length) return;
      const hydrated = await Promise.all(index.map((i) => hydrateInboxReport(i)));
      setReports((prev) => {
        const incomingById = new Map(hydrated.map((r) => [r.id, r]));
        const next: ReportBoxReport[] = prev.map((r) => {
          const incoming = incomingById.get(r.id);
          if (!incoming) return r;

          // Keep UI-handled fields from local state, but treat inbox as the source of truth for adds/removes/edits.
          const localByMessageId = new Map(r.messages.map((m) => [m.id, m]));
          const mergedMessages = incoming.messages.map((inMsg) => {
            const local = localByMessageId.get(inMsg.id);
            if (!local) return inMsg;
            return {
              ...inMsg,
              text: local.text || inMsg.text,
              attachment:
                local.attachment?.dataUrl || local.attachment?.url ? local.attachment : inMsg.attachment,
              durationSec: local.durationSec ?? inMsg.durationSec,
            };
          });

          return {
            ...incoming,
            flagged: r.flagged,
            status: r.status,
            category: r.category,
            assignedTo: r.assignedTo,
            handledAt: r.handledAt,
            messages: mergedMessages,
          };
        });

        const existing = new Set(prev.map((r) => r.id));
        for (const r of hydrated) {
          if (!existing.has(r.id)) next.push(r);
        }

        next.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        return next;
      });
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    void refreshFromInbox();
  }, [refreshFromInbox]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // ignore
    }
  }, [reports]);

  const addReport = React.useCallback((input: NewReportInput) => {
    const createdAt = nowIso();
    const id = createId("rpt");
    const report: ReportBoxReport = {
      id,
      createdAt,
      facilityId: input.facilityId,
      channel: "public",
      origin: "local",
      status: "new",
      flagged: false,
      subject: input.subject.trim() || "New report",
      messages: [
        {
          id: createId("msg"),
          at: createdAt,
          kind: input.kind,
          text: input.text?.trim() || undefined,
          attachment: input.attachment,
          durationSec: input.durationSec,
        },
      ],
    };
    setReports((prev) => [report, ...prev]);
    return id;
  }, []);

  const addMessage = React.useCallback(
    (id: string, input: NewMessageInput) => {
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const createdAt = nowIso();
          return {
            ...r,
            messages: [
              ...r.messages,
              {
                id: createId("msg"),
                at: createdAt,
                kind: input.kind,
                text: input.text?.trim() || undefined,
                attachment: input.attachment,
                durationSec: input.durationSec,
              },
            ],
          };
        }),
      );
    },
    [],
  );

  const toggleFlag = React.useCallback((id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, flagged: !r.flagged } : r)),
    );
  }, []);

  const setStatus = React.useCallback(
    (id: string, status: ReportBoxReport["status"]) => {
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            status,
            handledAt: status === "handled" ? nowIso() : undefined,
          };
        }),
      );
    },
    [],
  );

  const setCategory = React.useCallback((id: string, category?: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, category: category || undefined } : r)),
    );
  }, []);

  const assignTo = React.useCallback((id: string, assignee?: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, assignedTo: assignee || undefined } : r,
      ),
    );
  }, []);

  const removeReport = React.useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const deleteReport = React.useCallback(
    async (id: string) => {
      const target = reports.find((r) => r.id === id);
      // Remove from UI first for fast feedback
      setReports((prev) => prev.filter((r) => r.id !== id));

      // If it came from inbox files, also delete from inbox index + files (dev-only endpoint)
      if (target?.origin === "inbox") {
        try {
          await fetch(INBOX_DELETE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
        } catch {
          // ignore
        }
      }
    },
    [reports],
  );

  const value = React.useMemo<ReportBoxContextValue>(
    () => ({
      reports,
      addReport,
      toggleFlag,
      setStatus,
      setCategory,
      assignTo,
      addMessage,
      removeReport,
      deleteReport,
      refreshFromInbox,
    }),
    [reports, addReport, toggleFlag, setStatus, setCategory, assignTo, addMessage, removeReport, deleteReport, refreshFromInbox],
  );

  return (
    <ReportBoxContext.Provider value={value}>
      {children}
    </ReportBoxContext.Provider>
  );
}

export function useReportBox() {
  const ctx = React.useContext(ReportBoxContext);
  if (!ctx) {
    throw new Error("useReportBox must be used within <ReportBoxProvider />");
  }
  return ctx;
}
