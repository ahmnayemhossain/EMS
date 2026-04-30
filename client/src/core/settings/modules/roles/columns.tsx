import type { DataColumn } from "@/core/components/DataTable";
import { StatusBadge } from "@/core/components/StatusBadge";
import type { RoleEntity } from "@/core/settings/modules/settingsEntityApi";

export function buildRoleColumns(): Array<DataColumn<RoleEntity>> {
  return [
    { id: "name", header: "Role", cell: (role) => <div className="min-w-0"><div className="truncate text-sm font-medium">{role.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{role.permissionKeys.length} permissions</div></div> },
    { id: "status", header: "Status", cell: (role) => <StatusBadge tone={role.status === 1 ? "compliant" : "neutral"}>{role.status === 1 ? "active" : "inactive"}</StatusBadge>, className: "text-right" },
  ];
}
