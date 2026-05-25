import { query } from "../../../../core/shared/postgres.js";
import { sendUtilityApprovalSubmissionEmail } from "../../../../core/shared/utility-approval-email.js";
import { rowToRecord } from "../../../modules/utilities/record.js";
import { createHttpError, toDateString } from "../../../modules/utilities/record.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { getRequestUserDbId } from "../request-context.js";
import { getUtilityWorkflowContext, resolveUtilityWorkflowTransition } from "./workflow-access.js";

function endOfMonth(value) {
  const [year, month] = toDateString(value).split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 0));
  return toDateString(date);
}

export async function transitionUtilityMonth(req, res, next) {
  try {
    const updated = await runUtilityMonthTransition({
      recordId: Number(req.params.id),
      userId: await getRequestUserDbId(req),
      transitionKey: String(req.body?.transitionKey || "").trim().toLowerCase(),
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function runUtilityMonthTransition(input) {
    const transitionKey = String(input.transitionKey || "").trim().toLowerCase();
    if (!transitionKey) throw createHttpError(400, "Transition key is required.");
    const context = await getUtilityWorkflowContext(input);
    const { actorUserId, record, approval, currentStepKey } = context;
    const transition = resolveUtilityWorkflowTransition(context, transitionKey);
    const nextStepKey = String(transition.toStepKey || transition.to_step_key || "").trim().toLowerCase();
    if (!nextStepKey) {
      throw createHttpError(400, "Target approval status is invalid.");
    }
    const isReturningToDraft = nextStepKey === "draft";
    if (Number(approval.record_count || 0) <= 0) {
      throw createHttpError(400, "No monthly utility data found for workflow action.");
    }
    if (!isReturningToDraft) {
      if (Number(approval.missing_days_count || 0) > 0) {
        throw createHttpError(409, "This month has missing day coverage. Complete the month before moving forward.");
      }
      if (
        !approval.coverage_start ||
        !approval.coverage_end ||
        toDateString(approval.coverage_start) !== toDateString(record.period_month) ||
        toDateString(approval.coverage_end) !== endOfMonth(record.period_month)
      ) {
        throw createHttpError(409, "Only full-month utility data can move forward in the approval flow.");
      }
    }

    await query(
      `UPDATE utility_monthly_approvals
          SET approval_status = $2,
              approved_by_user_id = CASE
                WHEN $2 = 'approved' THEN COALESCE(approved_by_user_id, $3::bigint)
                WHEN $2 = 'audited' THEN approved_by_user_id
                ELSE NULL
              END,
              approved_at = CASE
                WHEN $2 = 'approved' THEN COALESCE(approved_at, NOW())
                WHEN $2 = 'audited' THEN approved_at
                ELSE NULL
              END,
              updated_by_user_id = $3::bigint,
              updated_at = NOW()
        WHERE id = $1`,
      [approval.id, nextStepKey, actorUserId],
    );

    await query(
      `INSERT INTO utility_monthly_approval_history
        (monthly_approval_id, from_status, to_status, actor_user_id)
       VALUES ($1, $2, $3, $4::bigint)`,
      [approval.id, currentStepKey, nextStepKey, actorUserId],
    );

    if (nextStepKey === "submitted") {
      const detailRes = await query(
        `SELECT uma.*, c.name AS company_name, ut.name AS utility_type_name, COALESCE(e.name, u.username) AS submitted_by
           FROM utility_monthly_approvals uma
           JOIN companies c ON c.id = uma.facility_id
           LEFT JOIN utility_types ut ON ut.key = uma.type
          LEFT JOIN users u ON u.id = $2
           LEFT JOIN employees e ON e.id = u.employee_id
          WHERE uma.id = $1`,
        [approval.id, actorUserId],
      );
      const detail = detailRes.rows[0];
      try {
        await sendUtilityApprovalSubmissionEmail({
          companyName: detail.company_name,
          utilityType: detail.utility_type_name || detail.type,
          meterName: detail.meter_name,
          billMonth: String(detail.period_month).slice(0, 7),
          recordCount: Number(detail.record_count || 0),
          totalValue: Number(detail.total_value || 0),
          unit: detail.uom || "",
          submittedBy: detail.submitted_by || "",
        });
      } catch (error) {
        console.error("[utility-approval-email]", error instanceof Error ? error.message : error);
      }
    }

    const refreshed = await query(`${selectUtilitySql} WHERE ur.id = $1`, [input.recordId]);
    return rowToRecord(refreshed.rows[0]);
}
