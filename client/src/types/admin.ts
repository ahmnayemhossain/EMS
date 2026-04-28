import type { ID } from "@/types/ems";

export type EmployeeStatus = "active" | "inactive";
export type EmployeeActiveStatus = 0 | 1;

export type Employee = {
  id: ID;
  name: string;
  employeeId: number;
  companyId: ID;
  departmentId: ID;
  designationId: ID;
  status: EmployeeActiveStatus;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  joinedOn?: string; // ISO date
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

export type PermissionKey = string;

export type RoleScope = "group" | "company";

export type Role = {
  id: ID;
  name: string;
  scope: RoleScope;
  description?: string;
  permissionKeys: PermissionKey[];
};
