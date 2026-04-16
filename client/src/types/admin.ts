import type { ID } from "@/types/ems";

export type EmployeeStatus = "active" | "inactive";

export type Employee = {
  id: ID;
  name: string;
  employeeId: string; // e.g. "700901"
  factoryId: ID;
  department: string;
  designation: string;
  status: EmployeeStatus;
  joinedOn: string; // ISO date
};

export type UserStatus = "active" | "suspended";

export type AppUser = {
  id: ID;
  employeeId: string;
  username: string;
  email: string;
  roleIds: ID[];
  status: UserStatus;
  lastLoginAt?: string; // ISO date-time
};

export type PermissionKey =
  | "dashboard:view"
  | "utilities:manage"
  | "chemicals:manage"
  | "sds:manage"
  | "waste:manage"
  | "wastewater:manage"
  | "audits:manage"
  | "capa:manage"
  | "documents:manage"
  | "complaints:triage"
  | "complaints:handle"
  | "settings:manage";

export type RoleScope = "group" | "factory";

export type Role = {
  id: ID;
  name: string;
  scope: RoleScope;
  description?: string;
  permissionKeys: PermissionKey[];
};

