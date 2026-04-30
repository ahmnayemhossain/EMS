import { getFacilityIdByValue, getRequestUserValue, getUserIdByValue } from "../../../core/shared/schema.js";
import { createHttpError } from "../../modules/utilities/record.js";

export async function getRequestUserDbId(req) {
  return getUserIdByValue(getRequestUserValue(req));
}

export async function getCompanyDbIdOrThrow(companyId) {
  const companyDbId = await getFacilityIdByValue(companyId);
  if (!companyDbId) throw createHttpError(400, "Invalid facility.");
  return companyDbId;
}
