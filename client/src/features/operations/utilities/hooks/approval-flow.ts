import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";

function toTitleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((item) => item.slice(0, 1).toUpperCase() + item.slice(1))
    .join(" ");
}

export function getStepName(flow: UtilityApprovalFlow | null | undefined, stepKey?: string) {
  const key = String(stepKey || "draft").trim().toLowerCase() || "draft";
  return flow?.steps.find((step) => step.key === key)?.name || toTitleCase(key);
}

export function getWorkflowStatus(row: UtilityRecord, flow?: UtilityApprovalFlow | null) {
  const currentStep = String(row.approvalStatus || "draft").trim().toLowerCase() || "draft";

  if (Number(row.missingDaysCount || 0) > 0) {
    return {
      tone: "warning" as const,
      label: "Coverage missing",
      detail: formatMissingRanges(row.missingRanges),
    };
  }

  if (currentStep === "draft") {
    if (row.monthComplete) {
      return { tone: "info" as const, label: "Ready to submit", detail: "Full month is covered" };
    }
    return { tone: "neutral" as const, label: "In progress", detail: "Month still incomplete" };
  }

  if (currentStep === "approved") {
    return {
      tone: "compliant" as const,
      label: getStepName(flow, currentStep),
      detail: row.approvedBy ? `Approved by ${row.approvedBy}` : "",
    };
  }

  if (currentStep === "audited") {
    return { tone: "info" as const, label: getStepName(flow, currentStep), detail: "Final audit stage" };
  }

  return {
    tone: "info" as const,
    label: getStepName(flow, currentStep),
    detail: "Approval workflow in progress",
  };
}

export function formatMissingRanges(ranges?: Array<{ start: string; end: string }>) {
  if (!ranges?.length) return "";
  return ranges
    .map((range) => {
      const start = range.start.slice(8, 10);
      const end = range.end.slice(8, 10);
      return start === end ? start : `${start}-${end}`;
    })
    .join(", ");
}
