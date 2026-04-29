const USERS_API = "/api/system/users";

export function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}

export function userHeaders(userId: string) {
  return { "Content-Type": "application/json", "x-user-id": toServerUserId(userId) };
}

export async function parseUserJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data ? String(data.error) : "User request failed.";
    throw new Error(message);
  }
  return data as T;
}

export function userApiPath(path = "") {
  return `${USERS_API}${path}`;
}
