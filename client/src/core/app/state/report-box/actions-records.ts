import type { ReportBoxApi } from "@/core/app/state/report-box/types";
import type { ReportBoxRecord } from "@/core/types/models/ems";

import { createId, nowIso } from "@/core/app/state/report-box/ids";

type SetReportBoxState = (
  recipe: (state: ReportBoxApi) => Partial<ReportBoxApi>,
) => void;

type GetReportBoxState = () => ReportBoxApi;

export function createAddRecord(set: SetReportBoxState, get: GetReportBoxState) {
  return (reportId: string) => {
    const report = get().reports.find((r) => r.id === reportId);
    if (!report) return null;

    const recordedAt = nowIso();
    const id = createId("rec");
    const title = report.subject?.trim() || "Complaint record";

    const record: ReportBoxRecord = {
      id,
      reportId,
      recordedAt,
      title,
      snapshot: report,
    };

    set((state) => ({ records: [record, ...state.records] }));
    return id;
  };
}

export function createRemoveRecord(set: SetReportBoxState) {
  return (recordId: string) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== recordId),
    }));
}
