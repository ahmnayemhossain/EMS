import { runUtilityMonthTransition } from "./transition-month.js";
import { getRequestUserDbId } from "../request-context.js";

export async function approveUtilityMonth(req, res, next) {
  try {
    const updated = await runUtilityMonthTransition({
      recordId: Number(req.params.id),
      userId: await getRequestUserDbId(req),
      transitionKey: "submitted_to_approved",
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}
