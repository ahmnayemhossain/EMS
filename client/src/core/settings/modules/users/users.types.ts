import type { UserInput } from "@/core/settings/modules/usersApi";

export type UserValidationErrors = Partial<
  Record<"employeeDbId" | "username" | "email" | "companyAccessIds" | "roleIds", string>
>;

export type UserRoleOption = {
  id: string;
  name: string;
  description?: string;
};

export type UserCompanyOption = {
  id: string;
  name: string;
};

export type UsersState = {
  users: UserInput[];
  employees: import("@/core/settings/modules/usersApi").UserEmployeeOption[];
  roles: UserRoleOption[];
  companies: UserCompanyOption[];
  loading: boolean;
};
