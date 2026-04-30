import { shallow } from "zustand/shallow";

import { ReportBoxInboxSync } from "@/core/app/state/report-box/ReportBoxInboxSync";
import { useReportBoxStore } from "@/core/app/state/report-box/store";
import type { ReportBoxApi } from "@/core/app/state/report-box/types";

export type { NewMessageInput, NewReportInput } from "@/core/app/state/report-box/types";
export { ReportBoxInboxSync };

export function useReportBox(): ReportBoxApi {
  return useReportBoxStore(
    (s) => ({
      reports: s.reports,
      records: s.records,
      addReport: s.addReport,
      setSubject: s.setSubject,
      addRecord: s.addRecord,
      removeRecord: s.removeRecord,
      toggleFlag: s.toggleFlag,
      setStatus: s.setStatus,
      setCategory: s.setCategory,
      assignTo: s.assignTo,
      addMessage: s.addMessage,
      removeReport: s.removeReport,
      deleteReport: s.deleteReport,
      refreshFromInbox: s.refreshFromInbox,
    }),
    shallow,
  );
}

