import type { ReportBoxRecord, ReportBoxReport } from "@/core/types/ems";

export type ComplaintBoxAction =
  | { kind: "delete-complaint"; report: ReportBoxReport }
  | { kind: "remove-record"; record: ReportBoxRecord }
  | null;
