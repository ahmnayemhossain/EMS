import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { DataTable, type DataColumn } from "@/core/components/DataTable";
import { StatusBadge } from "@/core/components/StatusBadge";
import type { SettingsEntity } from "@/core/settings/modules/settingsEntityApi";
import type { MasterWiringConfig, WiringDraft, WiringRow } from "@/core/settings/modules/master-wiring/types";

export function buildEntityColumns(config: MasterWiringConfig, actions: { onEdit: (row: SettingsEntity) => void; onDelete: (id: string) => void }): Array<DataColumn<SettingsEntity>> {
  return [{ id: "name", header: config.relationLabel, cell: (row) => <div className="min-w-0"><div className="truncate text-sm font-medium">{row.name}</div><div className="mt-0.5 text-xs text-muted-foreground">ID {row.id}</div></div> }, { id: "status", header: "Status", cell: (row) => <StatusBadge tone={row.status === 1 ? "compliant" : "neutral"}>{row.status === 1 ? "active" : "inactive"}</StatusBadge> }, { id: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => actions.onEdit({ ...row })} onDelete={() => actions.onDelete(row.id)} /> }];
}

export function buildWiringColumns(actions: { onEdit: (row: WiringDraft) => void; onDelete: (id: string) => void }): Array<DataColumn<WiringRow>> {
  return [{ id: "utilityType", header: "Utility Type", cell: (row) => <div className="min-w-0"><div className="truncate text-sm font-medium">{row.utilityTypeName}</div><div className="mt-0.5 text-xs text-muted-foreground">{row.utilityTypeKey}</div></div> }, { id: "relation", header: "Linked", cell: (row) => <div className="text-sm font-medium">{row.relationName}</div> }, { id: "status", header: "Status", cell: (row) => <StatusBadge tone={row.status === 1 ? "compliant" : "neutral"}>{row.status === 1 ? "active" : "inactive"}</StatusBadge> }, { id: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => actions.onEdit({ id: row.id, relationId: row.relationId, utilityTypeId: row.utilityTypeId, status: row.status })} onDelete={() => actions.onDelete(row.id)} /> }];
}

function RowActions(props: { onEdit: () => void; onDelete: () => void }) {
  return <div className="flex items-center justify-end gap-2"><Button type="button" size="icon" variant="outline" onClick={props.onEdit}><Pencil className="size-4" /></Button><Button type="button" size="icon" variant="outline" onClick={props.onDelete}><Trash2 className="size-4" /></Button></div>;
}
