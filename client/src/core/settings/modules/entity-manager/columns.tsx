import type { DataColumn } from "@/core/components/DataTable";
import { StatusBadge } from "@/core/components/StatusBadge";
import type { SettingsEntity } from "@/core/settings/modules/settingsEntityApi";

export function buildEntityManagerColumns(noun: string): Array<DataColumn<SettingsEntity>> {
  return [
    { id: "name", header: noun, cell: (row) => <div className="min-w-0"><div className="truncate text-sm font-medium">{row.name}</div><div className="mt-0.5 text-xs text-muted-foreground">ID {row.id}</div></div> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge tone={row.status === 1 ? "compliant" : "neutral"}>{row.status === 1 ? "active" : "inactive"}</StatusBadge>, className: "text-right" },
  ];
}
