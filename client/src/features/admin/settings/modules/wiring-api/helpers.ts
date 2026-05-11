import { createSystemHeaders, parseSystemResponse, SYSTEM_API } from "@/features/admin/settings/modules/api/system-api";

export async function listWiring<T>(path: string, userId: string, fallback: string) {
  const response = await fetch(`${SYSTEM_API}/${path}`, { cache: "no-store", headers: createSystemHeaders(userId) });
  return parseSystemResponse<T[]>(response, fallback);
}

export async function listWiringLookups<T>(path: string, userId: string, fallback: string) {
  const response = await fetch(`${SYSTEM_API}/${path}/lookups/options`, { cache: "no-store", headers: createSystemHeaders(userId) });
  return parseSystemResponse<T>(response, fallback);
}

export async function saveWiring<T>(path: string, item: object, userId: string, fallback: string, id?: string) {
  const response = await fetch(`${SYSTEM_API}/${path}${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", headers: createSystemHeaders(userId), body: JSON.stringify(item) });
  return parseSystemResponse<T>(response, fallback);
}

export async function removeWiring(path: string, id: string, userId: string, fallback: string) {
  const response = await fetch(`${SYSTEM_API}/${path}/${id}`, { method: "DELETE", headers: createSystemHeaders(userId) });
  return parseSystemResponse<{ ok: true }>(response, fallback);
}
