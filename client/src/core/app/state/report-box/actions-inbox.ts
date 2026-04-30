import { hydrateInboxReport, loadInboxIndex } from "@/core/app/state/report-box/inbox";
import { mergeInboxReports } from "@/core/app/state/report-box/merge-inbox";
import type { ReportBoxApi } from "@/core/app/state/report-box/types";

type SetReportBoxState = (
  recipe: (state: ReportBoxApi) => Partial<ReportBoxApi>,
) => void;

export function createRefreshFromInbox(set: SetReportBoxState) {
  return async () => {
    try {
      const index = await loadInboxIndex();
      if (!index.length) return;
      const hydrated = await Promise.all(index.map((i) => hydrateInboxReport(i)));
      set((state) => ({ reports: mergeInboxReports(state.reports, hydrated) }));
    } catch {
      // ignore
    }
  };
}

