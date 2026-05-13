import { createSystemHeaders, parseSystemResponse } from "@/features/admin/settings/modules/api/system-api";

const API = "/api/system/utility-conversion-rules";

export type UtilityConversionRule = {
  id: string;
  companyId: string | null;
  key: string;
  value: number;
  isActive: boolean;
};

export async function listUtilityConversionRules(userId: string, input?: { companyId?: string }) {
  const params = new URLSearchParams();
  if (input?.companyId) params.set("companyId", input.companyId);
  const url = params.toString() ? `${API}?${params.toString()}` : API;
  const response = await fetch(url, { cache: "no-store", headers: createSystemHeaders(userId) });
  return parseSystemResponse<UtilityConversionRule[]>(response, "Utility rules request failed.");
}

export async function upsertUtilityConversionRule(userId: string, input: { companyId?: string | null; key: string; value: number; isActive?: boolean }) {
  const response = await fetch(API, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify({
      companyId: input.companyId ?? null,
      key: input.key,
      value: input.value,
      isActive: input.isActive === false ? 0 : 1,
    }),
  });
  return parseSystemResponse<UtilityConversionRule>(response, "Utility rules request failed.");
}


