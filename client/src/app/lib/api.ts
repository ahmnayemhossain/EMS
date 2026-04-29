import { useAuthStore } from "@/app/state/auth";

export function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}

export function authJsonHeaders(userId?: string, options?: { includeJsonContentType?: boolean }) {
  const token = useAuthStore.getState().token;

  return {
    ...(options?.includeJsonContentType === false ? {} : { "Content-Type": "application/json" }),
    ...(userId ? { "x-user-id": toServerUserId(userId) } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : fallbackMessage;
    throw new Error(message);
  }

  return data as T;
}

export async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}
