import type { ReportBoxApi, NewMessageInput, NewReportInput } from "@/core/app/state/report-box/types";
import type { ReportBoxReport } from "@/core/types/ems";

import { createId, nowIso } from "@/core/app/state/report-box/ids";

type SetReportBoxState = (recipe: (state: ReportBoxApi) => Partial<ReportBoxApi>) => void;

export function createReportFromInput(input: NewReportInput): ReportBoxReport {
  const createdAt = nowIso();
  return {
    id: createId("rpt"),
    createdAt,
    facilityId: input.facilityId,
    channel: "public",
    origin: "local",
    status: "new",
    flagged: false,
    subject: input.subject.trim() || "New report",
    messages: [createMessageFromInput(createdAt, input)],
  };
}

export function createMessageFromInput(createdAt: string, input: NewReportInput | NewMessageInput) {
  return {
    id: createId("msg"),
    at: createdAt,
    kind: input.kind,
    text: input.text?.trim() || undefined,
    attachment: input.attachment,
    durationSec: input.durationSec,
    author: "author" in input ? input.author : undefined,
  };
}

export function addReportToState(set: SetReportBoxState, report: ReportBoxReport) {
  set((state) => ({ reports: [report, ...state.reports] }));
}
