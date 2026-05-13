import type { AppUser, Role } from "@/core/types/models/admin";
import { parseUserJsonResponse, userApiPath, userHeaders } from "@/features/admin/settings/modules/services/usersApi.shared";

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

export async function listUsers(userId: string) {
  return parseUserJsonResponse<UserInput[]>(await fetch(userApiPath(), { cache: "no-store", headers: userHeaders(userId) }));
}

export async function listUserLookups() {
  return parseUserJsonResponse<UserLookups>(await fetch(userApiPath("/lookups/options"), { cache: "no-store" }));
}

export async function createUser(user: UserInput, userId: string) {
  return parseUserJsonResponse<UserInput>(await fetch(userApiPath(), {
    method: "POST",
    headers: userHeaders(userId),
    body: JSON.stringify(user),
  }));
}

export async function updateUser(user: UserInput, userId: string) {
  return parseUserJsonResponse<UserInput>(await fetch(userApiPath(`/${user.id}`), {
    method: "PUT",
    headers: userHeaders(userId),
    body: JSON.stringify(user),
  }));
}

export async function deleteUser(id: string, userId: string) {
  return parseUserJsonResponse<{ ok: true }>(await fetch(userApiPath(`/${id}`), {
    method: "DELETE",
    headers: userHeaders(userId),
  }));
}

export async function resetUserPassword(id: string, userId: string) {
  return parseUserJsonResponse<{ ok: true; password: string }>(await fetch(userApiPath(`/${id}/reset-password`), {
    method: "POST",
    headers: userHeaders(userId),
  }));
}

