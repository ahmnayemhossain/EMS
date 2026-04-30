import type { ReportBoxApi } from "@/core/app/state/report-box/types";
import type { ReportBoxReport } from "@/core/types/ems";

type SetReportBoxState = (recipe: (state: ReportBoxApi) => Partial<ReportBoxApi>) => void;

export function mapReports(set: SetReportBoxState, updater: (report: ReportBoxReport) => ReportBoxReport) {
  set((state) => ({ reports: state.reports.map(updater) }));
}

export function updateReportById(set: SetReportBoxState, id: string, updater: (report: ReportBoxReport) => ReportBoxReport) {
  mapReports(set, (report) => (report.id === id ? updater(report) : report));
}
