import type { RoleEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";

export type RoleValidationErrors = Partial<Record<"name" | "permissionKeys" | "status", string>>;

export type PermissionColumn = "read" | "write" | "update" | "delete";

export type PermissionGroup = {
  name: string;
  permissions: Partial<Record<PermissionColumn, import("@/features/admin/settings/modules/services/settingsEntityApi").PermissionOption>>;
};

export type RolesVm = {
  userId: string;
  roles: RoleEntity[];
  permissions: import("@/features/admin/settings/modules/services/settingsEntityApi").PermissionOption[];
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

