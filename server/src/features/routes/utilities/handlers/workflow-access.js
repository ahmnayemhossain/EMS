import { getUserWorkflowAccess } from "../../../../core/shared/approval-hierarchy.js";
import { query } from "../../../../core/shared/postgres.js";
import { createHttpError } from "../../../modules/utilities/record.js";
import { ensureUtilitiesReady } from "../ready.js";

function getStepIndex(flow, stepKey) {
  return (flow?.steps || []).findIndex((step) => step.key === stepKey);
}

function normalizeWorkflowStepKey(stepKey, flow) {
  const key = String(stepKey || "").trim().toLowerCase();
  if (!key) return "draft";
  const stepKeys = new Set((flow?.steps || []).map((step) => String(step.key || "").trim().toLowerCase()));
  if (stepKeys.has(key)) {
    return key;
  }

  const aliases = new Map([
    ["submit", "submitted"],
    ["submitted", "submit"],
    ["check", "checked"],
    ["checked", "check"],
    ["recommend", "recommended"],
    ["recommended", "recommend"],
    ["approve", "approved"],
    ["approved", "approve"],
    ["audit", "audited"],
    ["audited", "audit"],
    ["prepared", "draft"],
    ["pending", "draft"],
  ]);

  const alias = aliases.get(key);
  if (alias && stepKeys.has(alias)) {
    return alias;
  }

  return key;
}

function isReverseTransition(flow, currentStepKey, nextStepKey) {
  const currentIndex = getStepIndex(flow, currentStepKey);
  const nextIndex = getStepIndex(flow, nextStepKey);
  return nextIndex >= 0 && currentIndex >= 0 && nextIndex < currentIndex;
}

function canUseHighLevelReverse(flow, currentStepKey) {
  const approvedIndex = getStepIndex(flow, "approved");
  const currentIndex = getStepIndex(flow, currentStepKey);
  if (approvedIndex < 0 || currentIndex < approvedIndex) {
    return true;
  }

  return (flow?.transitions || []).some((transition) => {
    const transitionFrom = String(transition.fromStepKey || "").trim().toLowerCase();
    if (isReverseTransition(flow, transitionFrom, transition.toStepKey)) {
      return false;
    }
    const targetIndex = getStepIndex(flow, transition.toStepKey);
    return targetIndex >= approvedIndex;
  });
}

export async function getUtilityWorkflowContext(input) {
  await ensureUtilitiesReady();
  const actorUserId = Number(input.userId || 0);
  if (!Number.isFinite(actorUserId) || actorUserId <= 0) {
    throw createHttpError(401, "Invalid user context.");
  }

  const recordRes = await query(
    `SELECT id, facility_id, type, meter_key, period_month
       FROM utility_records
      WHERE id = $1
        AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = utility_records.facility_id)`,
    [Number(input.recordId), actorUserId],
  );
  const record = recordRes.rows[0];
  if (!record) throw createHttpError(404, "Utility record not found.");

  const approvalRes = await query(
    `SELECT *
       FROM utility_monthly_approvals
      WHERE facility_id = $1 AND type = $2 AND meter_key = $3 AND period_month = $4`,
    [record.facility_id, record.type, record.meter_key, record.period_month],
  );
  const approval = approvalRes.rows[0];
  if (!approval) throw createHttpError(404, "Monthly utility aggregate not found.");

  const workflowAccess = await getUserWorkflowAccess({
    moduleKey: "utilities",
    userId: actorUserId,
  });
  const currentStepKey = normalizeWorkflowStepKey(approval.approval_status || "draft", workflowAccess);
  const currentStepTransitions = (workflowAccess?.transitions || []).filter(
    (item) => normalizeWorkflowStepKey(item.fromStepKey, workflowAccess) === currentStepKey,
  );
  const availableTransitions = currentStepTransitions.filter((transition) => {
    if (!isReverseTransition(workflowAccess, currentStepKey, transition.toStepKey)) {
      return true;
    }
    return canUseHighLevelReverse(workflowAccess, currentStepKey);
  });

  return {
    actorUserId,
    record,
    approval,
    currentStepKey,
    workflowAccess,
    currentStepTransitions,
    availableTransitions,
  };
}

export function resolveUtilityWorkflowTransition(context, transitionKey) {
  const transition = context.availableTransitions.find(
    (item) => String(item.key || "").trim().toLowerCase() === transitionKey,
  );
  if (transition) {
    return transition;
  }

  if (!context.currentStepTransitions.length) {
    throw createHttpError(403, "No approval action is assigned to you for the current status.");
  }

  const assignedButRestricted = context.currentStepTransitions.find(
    (item) => String(item.key || "").trim().toLowerCase() === transitionKey,
  );
  if (assignedButRestricted) {
    throw createHttpError(403, "Only approve-level or higher users can reverse this status.");
  }

  throw createHttpError(403, "This status change is not assigned to you. Check Role wise status or User wise status.");
}
