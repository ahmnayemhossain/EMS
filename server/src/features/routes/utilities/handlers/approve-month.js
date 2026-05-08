import { query } from "../../../../core/shared/postgres.js";
import { rowToRecord } from "../../../modules/utilities/record.js";
import { selectUtilitySql } from "../../../modules/utilities/files.js";
import { approveUtilityMonthByRecordId } from "../../../modules/utilities/monthly-approval.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getRequestUserDbId } from "../request-context.js";

export async function approveUtilityMonth(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const userDbId = await getRequestUserDbId(req);
    const record = await approveUtilityMonthByRecordId({
      recordId: Number(req.params.id),
      userId: userDbId,
    });
    const refreshed = await query(`${selectUtilitySql} WHERE ur.id = $1`, [record.id]);
    res.json(rowToRecord(refreshed.rows[0]));
  } catch (error) {
    next(error);
  }
}
