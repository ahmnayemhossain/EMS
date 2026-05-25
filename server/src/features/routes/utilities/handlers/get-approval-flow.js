import { listUserGroupTransitions } from "../../../../core/shared/approval-hierarchy.js";
import { ensureUtilitiesReady } from "../ready.js";
import { getRequestUserDbId } from "../request-context.js";
import { getUtilityWorkflowContext } from "./workflow-access.js";

export async function getUtilityApprovalFlow(req, res, next) {
  try {
    await ensureUtilitiesReady();
    const userDbId = await getRequestUserDbId(req);
    if (!userDbId) {
      return res.json({ group: null, steps: [], transitions: [] });
    }
    if (req.params.id) {
      const context = await getUtilityWorkflowContext({
        recordId: Number(req.params.id),
        userId: userDbId,
      });
      return res.json({
        group: context.workflowAccess.group,
        steps: context.workflowAccess.steps,
        transitions: context.availableTransitions,
        currentStepKey: context.currentStepKey,
      });
    }
    res.json(await listUserGroupTransitions({ moduleKey: "utilities", userId: userDbId }));
  } catch (error) {
    next(error);
  }
}
