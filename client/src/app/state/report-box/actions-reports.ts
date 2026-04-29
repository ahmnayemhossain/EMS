import type { ReportBoxApi, NewMessageInput, NewReportInput } from "@/app/state/report-box/types";
import type { ReportBoxReport } from "@/types/ems";

import { INBOX_DELETE_URL } from "@/app/state/report-box/constants";
import { nowIso } from "@/app/state/report-box/ids";
import { addReportToState, createMessageFromInput, createReportFromInput } from "@/app/state/report-box/report-factories";
import { updateReportById } from "@/app/state/report-box/report-updaters";

type SetReportBoxState = (
  recipe: (state: ReportBoxApi) => Partial<ReportBoxApi>,
) => void;

type GetReportBoxState = () => ReportBoxApi;

export function createAddReport(set: SetReportBoxState) {
  return (input: NewReportInput) => {
    const report = createReportFromInput(input);
    addReportToState(set, report);
    return report.id;
  };
}

export function createSetSubject(set: SetReportBoxState) {
  return (id: string, subject: string) => updateReportById(set, id, (report) => ({ ...report, subject }));
}

export function createAddMessage(set: SetReportBoxState) {
  return (id: string, input: NewMessageInput) =>
    updateReportById(set, id, (report) => {
      const createdAt = nowIso();
      return { ...report, messages: [...report.messages, createMessageFromInput(createdAt, input)] };
    });
}

export function createToggleFlag(set: SetReportBoxState) {
  return (id: string) => updateReportById(set, id, (report) => ({ ...report, flagged: !report.flagged }));
}

export function createSetStatus(set: SetReportBoxState) {
  return (id: string, status: ReportBoxReport["status"], meta?: { handledBy?: string }) =>
    updateReportById(set, id, (report) => ({
      ...report,
      status,
      handledAt: status === "handled" ? nowIso() : undefined,
      handledBy: status === "handled" ? meta?.handledBy || report.handledBy : undefined,
    }));
}

export function createSetCategory(set: SetReportBoxState) {
  return (id: string, category?: string) => updateReportById(set, id, (report) => ({ ...report, category: category || undefined }));
}

export function createAssignTo(set: SetReportBoxState) {
  return (id: string, assignee?: string) => updateReportById(set, id, (report) => ({ ...report, assignedTo: assignee || undefined }));
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
