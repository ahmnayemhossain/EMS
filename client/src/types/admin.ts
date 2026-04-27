import type { ID } from "@/types/ems";

export type EmployeeStatus = "active" | "inactive";
export type EmployeeActiveStatus = 0 | 1;

export type Employee = {
  id: ID;
  name: string;
  employeeId: number;
  factoryId: ID;
  departmentId: ID;
  designationId: ID;
  status: EmployeeActiveStatus;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  joinedOn: string; // ISO date
};

export type UserStatus = "active" | "suspended";

export type AppUser = {
  id: ID;
  employeeId: number;
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
