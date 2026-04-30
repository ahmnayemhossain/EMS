export const SYSTEM_API = "/api/system";

export function createSystemHeaders(userId: string) {
  return {
    "Content-Type": "application/json",
    "x-user-id": toServerUserId(userId),
  };
}

export async function parseSystemResponse<T>(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data ? String(data.error) : fallback;
    throw new Error(message);
  }
  return data as T;
}

function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}
