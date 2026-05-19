import { listUserGroupTransitions } from "../../../../core/shared/approval-hierarchy.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getRequestUserDbId } from "../request-context.js";

export async function getUtilityApprovalFlow(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) {
      return res.json({ group: null, steps: [], transitions: [] });
    }
    res.json(await listUserGroupTransitions({ moduleKey: "utilities", userId: userDbId }));
  } catch (error) {
    next(error);
  }
}
