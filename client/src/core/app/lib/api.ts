import { useAuthStore } from "@/core/app/state/auth";

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
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      if (comma === -1) resolve(result);
      else resolve(result.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });

  return base64;
}
