import { permissionColumns, permissionColumnLabels, groupPermissions } from "@/core/settings/modules/roles/helpers";
import type { PermissionOption } from "@/core/settings/modules/settingsEntityApi";

export function PermissionListView(props: { permissionKeys: string[]; permissions: PermissionOption[] }) {
  const rows = groupPermissions(props.permissions).map((group) => ({ name: group.name, actions: permissionColumns.filter((column) => { const permission = group.permissions[column]; return permission && props.permissionKeys.includes(permission.key); }).map((column) => permissionColumnLabels[column]) })).filter((row) => row.actions.length);
  if (!rows.length) return <div className="text-sm text-muted-foreground">No permissions selected.</div>;
  return <div className="w-full rounded-md border bg-background text-left">{rows.map((row) => <div key={row.name} className="grid grid-cols-[minmax(0,1fr)_auto] border-b last:border-b-0"><div className="min-w-0 px-3 py-2 text-sm font-medium"><span className="block truncate">{row.name}</span></div><div className="px-3 py-2 text-right text-xs text-muted-foreground">{row.actions.join(", ")}</div></div>)}</div>;
}
