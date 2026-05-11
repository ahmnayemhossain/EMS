import type { AuthUser } from "@/core/app/state/slices/auth";

type SignInInput = { login: string; password: string };

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data ? String(data.error) : "Authentication request failed.";
    throw new Error(message);
  }
  return data as T;
}

export async function signInRequest(input: SignInInput) {
  return parseJsonResponse<{ token: string; user: AuthUser }>(
    await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function signOutRequest(token: string) {
  await fetch("/api/auth/sign-out", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
}
