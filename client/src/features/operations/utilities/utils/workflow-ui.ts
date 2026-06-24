import type { UtilityApprovalFlow, UtilityApprovalTransition, UtilityRecord } from "@/core/types/models/ems";
import { getStepName } from "@/features/operations/utilities/hooks/approval-flow";

export type WorkflowDirection = "forward" | "reverse";

const STEP_KEY_ALIASES: Record<string, string[]> = {
  draft: ["draft", "prepared", "pending"],
  submit: ["submit", "submitted"],
  check: ["check", "checked"],
  recommend: ["recommend", "recommended"],
  approve: ["approve", "approved"],
  audit: ["audit", "audited"],
};

export function getOrderedWorkflowSteps(flow: UtilityApprovalFlow | null | undefined) {
  return (flow?.steps || [])
    .filter((step) => step.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function normalizeWorkflowStepKey(flow: UtilityApprovalFlow | null | undefined, stepKey?: string) {
  const rawKey = String(stepKey || "draft").trim().toLowerCase() || "draft";
  const steps = getOrderedWorkflowSteps(flow);
  if (steps.some((step) => step.key === rawKey)) {
    return rawKey;
  }

  for (const aliases of Object.values(STEP_KEY_ALIASES)) {
    if (!aliases.includes(rawKey)) continue;
    const matchedStep = steps.find((step) => aliases.includes(step.key));
    if (matchedStep) {
      return matchedStep.key;
    }
  }

  return rawKey;
}

export function getStepIndex(flow: UtilityApprovalFlow | null | undefined, stepKey: string) {
  const normalizedStepKey = normalizeWorkflowStepKey(flow, stepKey);
  return getOrderedWorkflowSteps(flow).findIndex((step) => step.key === normalizedStepKey);
}

export function getTransitionDirection(
  flow: UtilityApprovalFlow | null | undefined,
  currentStepKey: string,
  transition: UtilityApprovalTransition | null,
): WorkflowDirection {
  if (!transition) return "forward";
  const currentIndex = getStepIndex(flow, currentStepKey);
  const nextIndex = getStepIndex(flow, transition.toStepKey);
  return nextIndex < currentIndex ? "reverse" : "forward";
}

export function splitTransitionsByDirection(
  flow: UtilityApprovalFlow | null | undefined,
  currentStepKey: string,
  transitions: UtilityApprovalTransition[],
) {
  const forward: UtilityApprovalTransition[] = [];
  const reverse: UtilityApprovalTransition[] = [];

  for (const transition of transitions) {
    if (getTransitionDirection(flow, currentStepKey, transition) === "reverse") {
      reverse.push(transition);
    } else {
      forward.push(transition);
    }
  }

  return { forward, reverse };
}

export function readWorkflowStatusLabel(stepKey: string, flow: UtilityApprovalFlow | null | undefined) {
  const key = normalizeWorkflowStepKey(flow, stepKey);
  if (key === "draft") return "Draft";
  if (key === "submitted" || key === "submit") return "Submit";
  if (key === "checked" || key === "check") return "Check";
  if (key === "recommended" || key === "recommend") return "Recommend";
  if (key === "approved" || key === "approve") return "Approve";
  if (key === "audited" || key === "audit") return "Audit";
  return getStepName(flow || null, key);
}

export function readWorkflowConfirmTitle(direction: WorkflowDirection) {
  return direction === "reverse" ? "Reject this status change?" : "Save this status change?";
}

export function readWorkflowConfirmDescription(
  flow: UtilityApprovalFlow | null | undefined,
  currentStepKey: string,
  nextStepKey: string,
) {
  return `This will move the month from ${getStepName(flow || null, currentStepKey)} to ${readWorkflowStatusLabel(nextStepKey, flow)}.`;
}

export function isWorkflowTransitionBlocked(
  flow: UtilityApprovalFlow | null | undefined,
  currentStepKey: string,
  transition: UtilityApprovalTransition,
  record: UtilityRecord | null,
) {
  if (!record) return true;
  if (getTransitionDirection(flow, currentStepKey, transition) === "reverse") {
    return false;
  }
  return !record.monthComplete || Number(record.missingDaysCount || 0) > 0;
}
