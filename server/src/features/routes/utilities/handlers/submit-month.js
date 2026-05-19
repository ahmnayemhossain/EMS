import { runUtilityMonthTransition } from "./transition-month.js";
import { getRequestUserDbId } from "../request-context.js";

export async function submitUtilityMonth(req, res, next) {
  try {
    const updated = await runUtilityMonthTransition({
      recordId: Number(req.params.id),
      userId: await getRequestUserDbId(req),
      transitionKey: "draft_to_submitted",
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}
