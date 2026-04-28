import type { AppUser, Role } from "@/types/admin";

const USERS_API = "/api/system/users";

export type UserEmployeeOption = {
  id: string;
  employeeId: number;
  name: string;
  email: string;
  companyId?: string;
  companyName?: string;
};

export type UserLookups = {
  employees: UserEmployeeOption[];
  roles: Role[];
  facilities: Array<{ id: string; name: string }>;
};

export type UserInput = AppUser & {
  employeeDbId?: string;
  employeeName?: string;
  companyId?: string;
  companyName?: string;
  companyAccessIds?: string[];
  createdByUserId?: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}

function headers(userId: string) {
  return {
    "Content-Type": "application/json",
    "x-user-id": toServerUserId(userId),
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : "User request failed.";
    throw new Error(message);
  }

  return data as T;
}

export async function listUsers(userId: string) {
  const response = await fetch(USERS_API, { cache: "no-store", headers: headers(userId) });
  return parseJsonResponse<UserInput[]>(response);
}

export async function listUserLookups() {
  const response = await fetch(`${USERS_API}/lookups/options`, { cache: "no-store" });
  return parseJsonResponse<UserLookups>(response);
}

export async function createUser(user: UserInput, userId: string) {
  const response = await fetch(USERS_API, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(user),
  });

  return parseJsonResponse<UserInput>(response);
}

export async function updateUser(user: UserInput, userId: string) {
  const response = await fetch(`${USERS_API}/${user.id}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(user),
  });

  return parseJsonResponse<UserInput>(response);
}

export async function deleteUser(id: string, userId: string) {
  const response = await fetch(`${USERS_API}/${id}`, {
    method: "DELETE",
    headers: headers(userId),
  });

  return parseJsonResponse<{ ok: true }>(response);
}

export async function resetUserPassword(id: string, userId: string) {
  const response = await fetch(`${USERS_API}/${id}/reset-password`, {
    method: "POST",
    headers: headers(userId),
  });

  return parseJsonResponse<{ ok: true; password: string }>(response);
}
