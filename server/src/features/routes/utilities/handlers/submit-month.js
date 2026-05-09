import { query } from "../../../../core/shared/postgres.js";
import { rowToRecord } from "../../../modules/utilities/record.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { submitUtilityMonthByRecordId } from "../../../modules/utilities/monthly-approval.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getRequestUserDbId } from "../request-context.js";
import { sendUtilityApprovalSubmissionEmail } from "../../../../core/shared/utility-approval-email.js";

export async function submitUtilityMonth(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const userDbId = await getRequestUserDbId(req);
    const approval = await submitUtilityMonthByRecordId({
      recordId: Number(req.params.id),
      userId: userDbId,
    });

    const detailRes = await query(
      `SELECT uma.*, c.name AS company_name, ut.name AS utility_type_name, COALESCE(e.name, u.username) AS submitted_by
         FROM utility_monthly_approvals uma
         JOIN companies c ON c.id = uma.facility_id
         LEFT JOIN utility_types ut ON ut.key = uma.type
         LEFT JOIN users u ON u.id = $2
         LEFT JOIN employees e ON e.id = u.employee_id
        WHERE uma.id = $1`,
      [approval.id, userDbId],
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

    const refreshed = await query(`${selectUtilitySql} WHERE ur.id = $1`, [req.params.id]);
    res.json(rowToRecord(refreshed.rows[0]));
  } catch (error) {
    next(error);
  }
}
