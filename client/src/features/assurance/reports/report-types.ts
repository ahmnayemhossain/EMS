import type { UtilityRecord, UtilityType } from "@/core/types/models/ems";

export type ReportSummary = {
  totalRecords: number;
  flaggedRecords: number;
  attachmentCoverage: number;
  topType: { type: UtilityType; total: number } | null;
};

export type MonthlyReportSnapshot = [month: string, info: { count: number; total: number }];

export type ReportData = {
  loading: boolean;
  filteredRows: UtilityRecord[];
  recentRows: UtilityRecord[];
  monthlyRows: MonthlyReportSnapshot[];
  summary: ReportSummary;
};
