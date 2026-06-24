import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";
import { getStepIndex, normalizeWorkflowStepKey } from "@/features/operations/utilities/utils/workflow-ui";

export type ApprovalTrailItem = {
  actedBy?: string;
  actedAt?: string;
  note?: string;
};

export function buildApprovalTrail(
  record: UtilityRecord | null,
  flow: UtilityApprovalFlow | null,
  steps: Array<{ key: string }>,
) {
  if (!record) return new Map<string, ApprovalTrailItem>();

  const trail = new Map<string, ApprovalTrailItem>();

  if (steps.some((step) => step.key === "draft")) {
    trail.set("draft", {
      actedBy: record.monthlyCreatedBy,
      actedAt: record.monthlyCreatedAt,
    });
  }

  for (const item of record.approvalHistory || []) {
    const stepKey = normalizeWorkflowStepKey(flow, item.toStepKey);
    if (!stepKey) continue;

    trail.set(stepKey, {
      actedBy: item.actedBy,
      actedAt: item.actedAt,
      note: item.note,
    });
  }

  const approvedStepKey = steps.find((step) => step.key === "approved")?.key;
  if (approvedStepKey && (record.approvedBy || record.approvedAt)) {
    trail.set(approvedStepKey, {
      actedBy: record.approvedBy,
      actedAt: record.approvedAt,
    });
  }

  return trail;
}

export function buildRejectedSteps(
  record: UtilityRecord | null,
  flow: UtilityApprovalFlow | null,
) {
  const rejected = new Set<string>();
  if (!record) return rejected;

  for (const item of record.approvalHistory || []) {
    const fromStepKey = normalizeWorkflowStepKey(flow, item.fromStepKey);
    const toStepKey = normalizeWorkflowStepKey(flow, item.toStepKey);
    if (!fromStepKey || !toStepKey) continue;

    const fromIndex = getStepIndex(flow, fromStepKey);
    const toIndex = getStepIndex(flow, toStepKey);
    if (fromIndex < 0 || toIndex < 0) continue;

    if (toIndex < fromIndex) {
      rejected.add(fromStepKey);
      continue;
    }

    rejected.delete(toStepKey);
    for (const stepKey of Array.from(rejected)) {
      const rejectedIndex = getStepIndex(flow, stepKey);
      if (rejectedIndex <= toIndex) {
        rejected.delete(stepKey);
      }
    }
  }

  return rejected;
}
