import type { ReportBoxRecord, ReportBoxReport } from "@/types/ems";

export type ComplaintBoxAction =
  | { kind: "delete-complaint"; report: ReportBoxReport }
  | { kind: "remove-record"; record: ReportBoxRecord }
  | null;
