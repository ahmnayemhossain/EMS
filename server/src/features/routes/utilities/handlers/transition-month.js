import { getAllowedTransition } from "../../../../core/shared/approval-hierarchy.js";
import { query } from "../../../../core/shared/postgres.js";
import { sendUtilityApprovalSubmissionEmail } from "../../../../core/shared/utility-approval-email.js";
import { rowToRecord } from "../../../modules/utilities/record.js";
import { createHttpError, toDateString } from "../../../modules/utilities/record.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getRequestUserDbId } from "../request-context.js";

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
    await ensureUtilitiesReady();
    const transitionKey = String(input.transitionKey || "").trim().toLowerCase();
    if (!transitionKey) throw createHttpError(400, "Transition key is required.");
    const recordRes = await query(
      `SELECT id, facility_id, type, meter_key, period_month
         FROM utility_records
        WHERE id = $1
          AND EXISTS (SELECT 1 FROM user_companies uc WHERE uc.user_id = $2 AND uc.company_id = utility_records.facility_id)`,
      [Number(input.recordId), input.userId || -1],
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

    const currentStepKey = String(approval.approval_status || "draft").trim().toLowerCase() || "draft";
    const transition = await getAllowedTransition({
      moduleKey: "utilities",
      userId: input.userId,
      transitionKey,
      fromStepKey: currentStepKey,
    });
    if (!transition) throw createHttpError(403, "You do not have access to this approval action.");

    const nextStepKey = String(transition.to_step_key || "").trim().toLowerCase();
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
              approved_by_user_id = CASE WHEN $2 = 'approved' THEN $3 ELSE NULL END,
              approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE NULL END,
              updated_by_user_id = $3,
              updated_at = NOW()
        WHERE id = $1`,
      [approval.id, nextStepKey, input.userId],
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
        [approval.id, input.userId],
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
