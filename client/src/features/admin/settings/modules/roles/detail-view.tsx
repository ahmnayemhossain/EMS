import { Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailRow } from "@/features/admin/settings/modules/users/detail-row";
import { PermissionListView } from "@/features/admin/settings/modules/roles/permission-list-view";
import { RoleForm } from "@/features/admin/settings/modules/roles/form";
import type { PermissionOption, RoleEntity } from "@/features/admin/settings/modules/settingsEntityApi";
import type { RoleValidationErrors } from "@/features/admin/settings/modules/roles/roles.types";

export function RolesDetailView(props: { selected: RoleEntity; draft: RoleEntity | null; permissions: PermissionOption[]; errors: RoleValidationErrors; onDraftChange: (role: RoleEntity) => void; onCancel: () => void; onSave: () => void; onDelete: () => void; onEdit: () => void }) {
  return props.draft ? <div className="space-y-4"><RoleForm value={props.draft} onChange={props.onDraftChange} permissions={props.permissions} errors={props.errors} /><div className="flex items-center justify-between gap-2"><Button variant="outline" onClick={props.onCancel}><X className="mr-2 size-4" />Cancel</Button><Button onClick={props.onSave}>Save</Button></div></div> : <div className="space-y-4"><div className="rounded-lg border px-3"><DetailRow label="Name">{props.selected.name}</DetailRow><DetailRow label="Description">{props.selected.description || "-"}</DetailRow><DetailRow label="Status"><StatusBadge tone={props.selected.status === 1 ? "compliant" : "neutral"}>{props.selected.status === 1 ? "active" : "inactive"}</StatusBadge></DetailRow><DetailRow label="Permissions"><PermissionListView permissionKeys={props.selected.permissionKeys} permissions={props.permissions} /></DetailRow><DetailRow label="Created by">{props.selected.createdByUserName || "-"}</DetailRow><DetailRow label="Updated by">{props.selected.updatedByUserName || "-"}</DetailRow></div><div className="flex items-center justify-between gap-2"><Button variant="destructive" onClick={props.onDelete}><Trash2 className="mr-2 size-4" />Delete</Button><Button onClick={props.onEdit}><Pencil className="mr-2 size-4" />Edit</Button></div></div>;
}

