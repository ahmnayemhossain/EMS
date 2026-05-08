import { ensureCoreSchema } from "../../../core/shared/schema.js";
import { syncAllUtilityMonthlyApprovals } from "../../modules/utilities/monthly-approval.js";

let readyPromise;

export function ensureUtilitiesReady() {
  if (!readyPromise) {
    readyPromise = ensureCoreSchema().then(() => syncAllUtilityMonthlyApprovals());
  }

  return readyPromise;
}
