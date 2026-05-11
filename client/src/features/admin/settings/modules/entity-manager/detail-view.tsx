import { Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailRow } from "@/features/admin/settings/modules/users/detail-row";
import { EntityManagerForm } from "@/features/admin/settings/modules/entity-manager/form";
import type { SettingsEntity } from "@/features/admin/settings/modules/settingsEntityApi";
import type { EntityValidationErrors } from "@/features/admin/settings/modules/entity-manager/types";

export function EntityManagerDetailView(props: { selected: SettingsEntity; draft: SettingsEntity | null; noun: string; errors: EntityValidationErrors; onDraftChange: (item: SettingsEntity) => void; onCancel: () => void; onSave: () => void; onDelete: () => void; onEdit: () => void }) {
  return props.draft ? <div className="space-y-4"><EntityManagerForm value={props.draft} onChange={props.onDraftChange} label={props.noun} errors={props.errors} /><div className="flex items-center justify-between gap-2"><Button variant="outline" onClick={props.onCancel}><X className="mr-2 size-4" />Cancel</Button><Button onClick={props.onSave}>Save</Button></div></div> : <div className="space-y-4"><div className="rounded-lg border px-3"><DetailRow label="Name">{props.selected.name}</DetailRow><DetailRow label="Status"><StatusBadge tone={props.selected.status === 1 ? "compliant" : "neutral"}>{props.selected.status === 1 ? "active" : "inactive"}</StatusBadge></DetailRow><DetailRow label="Created by">{props.selected.createdByUserName || "-"}</DetailRow><DetailRow label="Updated by">{props.selected.updatedByUserName || "-"}</DetailRow></div><div className="flex items-center justify-between gap-2"><Button variant="destructive" onClick={props.onDelete}><Trash2 className="mr-2 size-4" />Delete</Button><Button onClick={props.onEdit}><Pencil className="mr-2 size-4" />Edit</Button></div></div>;
}

