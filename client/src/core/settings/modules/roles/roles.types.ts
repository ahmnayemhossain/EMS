import type { RoleEntity } from "@/core/settings/modules/settingsEntityApi";

export type RoleValidationErrors = Partial<Record<"name" | "permissionKeys" | "status", string>>;

export type PermissionColumn = "read" | "write" | "update" | "delete";

export type PermissionGroup = {
  name: string;
  permissions: Partial<Record<PermissionColumn, import("@/core/settings/modules/settingsEntityApi").PermissionOption>>;
};

export type RolesVm = {
  userId: string;
  roles: RoleEntity[];
  permissions: import("@/core/settings/modules/settingsEntityApi").PermissionOption[];
  loading: boolean;
  search: string;
  selected: RoleEntity | null;
  editDraft: RoleEntity | null;
  confirmDelete: boolean;
  createOpen: boolean;
  draft: RoleEntity;
  createErrors: RoleValidationErrors;
  editErrors: RoleValidationErrors;
};
