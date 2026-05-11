import { create } from "zustand";

import {
  createAddMessage,
  createAddReport,
  createAssignTo,
  createDeleteReport,
  createRemoveReport,
  createSetCategory,
  createSetStatus,
  createSetSubject,
  createToggleFlag,
} from "@/core/app/state/report-box/actions-reports";
import { createRefreshFromInbox } from "@/core/app/state/report-box/actions-inbox";
import { createAddRecord, createRemoveRecord } from "@/core/app/state/report-box/actions-records";
import {
  persistRecords,
  persistReports,
  readPersistedRecords,
  readPersistedReports,
} from "@/core/app/state/report-box/persist";
import type { ReportBoxApi } from "@/core/app/state/report-box/types";

export const useReportBoxStore = create<ReportBoxApi>((set, get) => ({
  reports: readPersistedReports(),
  records: readPersistedRecords(),

  refreshFromInbox: createRefreshFromInbox(set),

  addReport: createAddReport(set),
  setSubject: createSetSubject(set),
  addMessage: createAddMessage(set),
  toggleFlag: createToggleFlag(set),
  setStatus: createSetStatus(set),
  setCategory: createSetCategory(set),
  assignTo: createAssignTo(set),
  removeReport: createRemoveReport(set),
  deleteReport: createDeleteReport(set, get),

  addRecord: createAddRecord(set, get),
  removeRecord: createRemoveRecord(set),
}));

if (typeof window !== "undefined") {
  useReportBoxStore.subscribe((state) => persistReports(state.reports));
  useReportBoxStore.subscribe((state) => persistRecords(state.records));
}
