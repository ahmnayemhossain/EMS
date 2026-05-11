import type { ReportBoxRecord, ReportBoxReport } from "@/core/types/models/ems";

export type ComplaintBoxAction =
  | { kind: "delete-complaint"; report: ReportBoxReport }
  | { kind: "remove-record"; record: ReportBoxRecord }
  | null;
