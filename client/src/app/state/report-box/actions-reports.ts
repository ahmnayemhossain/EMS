import type { ReportBoxApi, NewMessageInput, NewReportInput } from "@/app/state/report-box/types";
import type { ReportBoxReport } from "@/types/ems";

import { INBOX_DELETE_URL } from "@/app/state/report-box/constants";
import { createId, nowIso } from "@/app/state/report-box/ids";

type SetReportBoxState = (
  recipe: (state: ReportBoxApi) => Partial<ReportBoxApi>,
) => void;

type GetReportBoxState = () => ReportBoxApi;

export function createAddReport(set: SetReportBoxState) {
  return (input: NewReportInput) => {
    const createdAt = nowIso();
    const id = createId("rpt");
    const subject = input.subject.trim() || "New report";

    const report: ReportBoxReport = {
      id,
      createdAt,
      facilityId: input.facilityId,
      channel: "public",
      origin: "local",
      status: "new",
      flagged: false,
      subject,
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

    set((state) => ({ reports: [report, ...state.reports] }));
    return id;
  };
}

export function createSetSubject(set: SetReportBoxState) {
  return (id: string, subject: string) =>
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? { ...r, subject } : r)),
    }));
}

export function createAddMessage(set: SetReportBoxState) {
  return (id: string, input: NewMessageInput) =>
    set((state) => ({
      reports: state.reports.map((r) => {
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
              author: input.author,
            },
          ],
        };
      }),
    }));
}

export function createToggleFlag(set: SetReportBoxState) {
  return (id: string) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, flagged: !r.flagged } : r,
      ),
    }));
}

export function createSetStatus(set: SetReportBoxState) {
  return (
    id: string,
    status: ReportBoxReport["status"],
    meta?: { handledBy?: string },
  ) =>
    set((state) => ({
      reports: state.reports.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          handledAt: status === "handled" ? nowIso() : undefined,
          handledBy:
            status === "handled" ? meta?.handledBy || r.handledBy : undefined,
        };
      }),
    }));
}

export function createSetCategory(set: SetReportBoxState) {
  return (id: string, category?: string) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, category: category || undefined } : r,
      ),
    }));
}

export function createAssignTo(set: SetReportBoxState) {
  return (id: string, assignee?: string) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, assignedTo: assignee || undefined } : r,
      ),
    }));
}

export function createRemoveReport(set: SetReportBoxState) {
  return (id: string) =>
    set((state) => ({ reports: state.reports.filter((r) => r.id !== id) }));
}

export function createDeleteReport(set: SetReportBoxState, get: GetReportBoxState) {
  return async (id: string) => {
    const target = get().reports.find((r) => r.id === id);
    set((state) => ({ reports: state.reports.filter((r) => r.id !== id) }));

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
  };
}

