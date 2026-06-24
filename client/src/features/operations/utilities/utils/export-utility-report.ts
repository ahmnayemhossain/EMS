import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";
import { formatDate, formatNumber, formatUtilityType } from "@/core/utils/format";
import { getStepName } from "@/features/operations/utilities/hooks/approval-flow";

export function exportUtilityReport(
  record: UtilityRecord,
  companyName: string,
  approvalFlow: UtilityApprovalFlow | null,
) {
  const lines = [
    "EMS Utility Report",
    `Generated at: ${formatDateTime(new Date().toISOString())}`,
    "",
    "[Overview]",
    `Company: ${companyName || "Company"}`,
    `Utility: ${formatUtilityType(record.type)}`,
    `Source: ${record.sourceName || "--"}`,
    `Meter: ${record.meterName || "--"}`,
    `Period: ${formatDate(record.periodStart)} to ${formatDate(record.periodEnd)}`,
    `Month: ${record.periodMonth || "--"}`,
    `Workflow: ${getStepName(approvalFlow, record.approvalStatus || approvalFlow?.currentStepKey || "draft")}`,
    "",
    "[Readings]",
    `Previous reading: ${formatOptionalNumber(record.previousReading, record.uom)}`,
    `Current reading: ${formatOptionalNumber(record.currentReading, record.uom)}`,
    `Consumption: ${formatNumber(record.value)} ${record.uom}`,
    `Diesel consumption: ${formatOptionalNumber(record.dieselLiters, "L")}`,
    "",
    "[Coverage]",
    `Coverage: ${formatCoverage(record)}`,
    `Missing dates: ${formatMissingRanges(record)}`,
    "",
    "[Variance]",
    `Baseline: ${formatOptionalNumber(record.baselineValue, record.uom)}`,
    `Variance: ${formatOptionalNumber(record.variance, record.uom)}`,
    `Variance percent: ${typeof record.variancePercent === "number" ? `${record.variancePercent.toFixed(1)}%` : "--"}`,
    `Variance flag: ${record.varianceFlag || "normal"}`,
    "",
    "[Attachments]",
    ...formatBillFiles(record),
    "",
    "[Approval History]",
    ...formatApprovalHistory(record, approvalFlow),
    "",
    "[Remarks]",
    record.remarks?.trim() || "No remarks",
    "",
  ];

  downloadTextFile(
    lines.join("\n"),
    buildFilename(record),
    "text/plain;charset=utf-8",
  );
}

function formatOptionalNumber(value: number | undefined, unit: string) {
  return typeof value === "number" ? `${formatNumber(value)} ${unit}` : "--";
}

function formatCoverage(record: UtilityRecord) {
  if (!record.coverageStart || !record.coverageEnd) return "--";
  const dayCount =
    typeof record.coverageDays === "number" && typeof record.monthDays === "number"
      ? ` (${record.coverageDays}/${record.monthDays} days)`
      : "";
  return `${formatDate(record.coverageStart)} to ${formatDate(record.coverageEnd)}${dayCount}`;
}

function formatMissingRanges(record: UtilityRecord) {
  if (!record.missingRanges?.length) return "None";
  return record.missingRanges
    .map((range) => (range.start === range.end ? range.start : `${range.start} to ${range.end}`))
    .join(", ");
}

function formatBillFiles(record: UtilityRecord) {
  if (!record.billFiles?.length) {
    return ["No bill files attached"];
  }
  return record.billFiles.map((file, index) => {
    const uploadedAt = file.uploadedAt ? ` (${formatDate(file.uploadedAt)})` : "";
    return `${index + 1}. ${file.name}${uploadedAt}`;
  });
}

function formatApprovalHistory(record: UtilityRecord, approvalFlow: UtilityApprovalFlow | null) {
  const lines: string[] = [];

  if (record.monthlyCreatedBy || record.monthlyCreatedAt) {
    lines.push(
      `Draft created by ${record.monthlyCreatedBy || "Unknown"}${record.monthlyCreatedAt ? ` on ${formatDateTime(record.monthlyCreatedAt)}` : ""}`,
    );
  }

  for (const item of record.approvalHistory || []) {
    const fromStep = item.fromStepKey ? getStepName(approvalFlow, item.fromStepKey) : "";
    const toStep = getStepName(approvalFlow, item.toStepKey);
    const transitionLabel = fromStep ? `${fromStep} -> ${toStep}` : toStep;
    const actor = item.actedBy || "Unknown";
    const actedAt = item.actedAt ? ` on ${formatDateTime(item.actedAt)}` : "";
    lines.push(`${transitionLabel} by ${actor}${actedAt}`);
    if (item.note?.trim()) {
      lines.push(`  Note: ${item.note.trim()}`);
    }
  }

  if (record.approvedBy && !hasApprovedHistory(record)) {
    lines.push(
      `Approved by ${record.approvedBy}${record.approvedAt ? ` on ${formatDateTime(record.approvedAt)}` : ""}`,
    );
  }

  return lines.length ? lines : ["No approval activity yet"];
}

function hasApprovedHistory(record: UtilityRecord) {
  return (record.approvalHistory || []).some((item) => {
    const stepKey = String(item.toStepKey || "").trim().toLowerCase();
    return stepKey === "approved" || stepKey === "approve";
  });
}

function buildFilename(record: UtilityRecord) {
  const meter = toFilenamePart(record.meterName || "meter");
  const period = `${record.periodStart || "period"}_${record.periodEnd || "period"}`;
  return `utility-report_${toFilenamePart(record.type)}_${meter}_${period}.txt`;
}

function toFilenamePart(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function downloadTextFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
