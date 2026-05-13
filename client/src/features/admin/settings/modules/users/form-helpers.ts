import type { UserEmployeeOption, UserInput } from "@/features/admin/settings/modules/services/usersApi";
import type { UserValidationErrors } from "@/features/admin/settings/modules/users/users.types";

export function blankUser(roleIds: string[]): UserInput {
  return {
    id: "",
    employeeDbId: "",
    employeeId: 0,
    username: "",
    email: "",
    companyAccessIds: [],
    roleIds: roleIds.length ? [roleIds[0]] : [],
    status: "active",
  };
}

export function validateUser(user: UserInput, users: UserInput[], currentId?: string) {
  const errors: UserValidationErrors = {};
  if (!user.employeeDbId) errors.employeeDbId = "Employee is required";
  if (!user.username.trim()) errors.username = "Username is required";
  else if (isDuplicate(users, currentId, user.username, "username")) errors.username = "Username already exists";
  if (!user.email.trim()) errors.email = "Email is required";
  else if (isDuplicate(users, currentId, user.email, "email")) errors.email = "Email already exists";
  if (!user.roleIds.length) errors.roleIds = "At least one role is required";
  if (!user.companyAccessIds?.length) errors.companyAccessIds = "At least one company access is required";
  return errors;
}

export function firstError(errors: UserValidationErrors) {
  return Object.values(errors)[0] ?? null;
}

export function buildUserFromEmployee(user: UserInput, employeeDbId: string, employees: UserEmployeeOption[]) {
  const employee = employees.find((row) => row.id === employeeDbId);
  return {
    ...user,
    employeeDbId,
    employeeId: employee?.employeeId ?? user.employeeId,
    username: employee?.employeeId ? String(employee.employeeId) : "",
    email: employee?.email || "",
    companyAccessIds: employee?.companyId ? [employee.companyId] : [],
  };
}

function isDuplicate(users: UserInput[], currentId: string | undefined, value: string, field: "username" | "email") {
  return users.some((row) => row.id !== currentId && row[field].toLowerCase() === value.toLowerCase());
}

