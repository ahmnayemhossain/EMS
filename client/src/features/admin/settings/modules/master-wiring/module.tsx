import { RefreshCw } from "lucide-react";
import { toast } from "@/core/app/lib/toast";

import { Button } from "@/components/ui/primitives/button";
import { ActionModal } from "@/components/feedback/ActionModal";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { DataTable } from "@/components/table/DataTable";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { createSettingsEntity, deleteSettingsEntity, updateSettingsEntity } from "@/features/admin/settings/modules/settingsEntityApi";
import { buildEntityColumns, buildWiringColumns } from "@/features/admin/settings/modules/master-wiring/columns";
import { EntityFilterBar, WiringFilterBar } from "@/features/admin/settings/modules/master-wiring/filters";
import { MasterEntityForm, WiringForm } from "@/features/admin/settings/modules/master-wiring/forms";
import type { MasterWiringApi, MasterWiringConfig, WiringDraft } from "@/features/admin/settings/modules/master-wiring/types";
import { useMasterWiring } from "@/features/admin/settings/modules/master-wiring/use-master-wiring";

export function MasterWiringModule(props: { config: MasterWiringConfig; api: MasterWiringApi }) {
  const vm = useMasterWiring(props.api);
  const entityRows = vm.entityRows.filter((row) => !vm.search.trim() || row.name.toLowerCase().includes(vm.search.trim().toLowerCase()));
  const wiringRows = vm.wiringRows.filter((row) => (!vm.wiringSearch.trim() || `${row.relationName} ${row.utilityTypeName} ${row.utilityTypeKey}`.toLowerCase().includes(vm.wiringSearch.trim().toLowerCase())) && (vm.utilityTypeFilter === "all" || row.utilityTypeId === vm.utilityTypeFilter) && (vm.statusFilter === "all" || String(row.status) === vm.statusFilter));
  const entityColumns = buildEntityColumns(props.config, { onEdit: vm.setEntityEdit, onDelete: vm.setDeleteEntityId });
  const wiringColumns = buildWiringColumns({ onEdit: vm.setWiringEdit, onDelete: vm.setDeleteWiringId });
  return <div className="space-y-4"><EntityFilterBar search={vm.search} onSearchChange={vm.setSearch} refreshAction={<Button variant="outline" size="icon" onClick={() => void vm.loadAll()} disabled={vm.loading}><RefreshCw className="size-4" /></Button>} onClear={() => vm.setSearch("")} /><MasterSection config={props.config} vm={vm} rows={entityRows} columns={entityColumns} /><WiringSection config={props.config} api={props.api} vm={vm} rows={wiringRows} columns={wiringColumns} /><EditDialogs config={props.config} api={props.api} vm={vm} /><DeleteDialogs config={props.config} api={props.api} vm={vm} /></div>;
}

type MasterEntityRow = { id: string; name: string; status: 0 | 1 };
type MasterWiringRow = { id: string; relationId: string; relationName: string; utilityTypeId: string; utilityTypeKey: string; utilityTypeName: string; status: 0 | 1 };

function MasterSection(props: { config: MasterWiringConfig; vm: any; rows: MasterEntityRow[]; columns: any }) {
  return <SectionCard title={props.config.relationLabel} description={`Create and maintain ${props.config.relationLabel.toLowerCase()} master records.`} action={<CreateActionDialog title={`Create ${props.config.relationLabel}`} triggerLabel={`Create ${props.config.relationLabel}`} submitLabel="Create" contentClassName="sm:max-w-xl" onCreate={() => saveEntity(props.vm, props.config.kind, "create")}><MasterEntityForm config={props.config} value={props.vm.entityDraft} onChange={props.vm.setEntityDraft} /></CreateActionDialog>} >{props.vm.loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}{!props.vm.loading && props.rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No {props.config.relationLabel.toLowerCase()} found.</div> : null}<DataTable rows={props.rows} columns={props.columns} rowKey={(row) => row.id} /></SectionCard>;
}

function WiringSection(props: { config: MasterWiringConfig; api: MasterWiringApi; vm: any; rows: MasterWiringRow[]; columns: any }) {
  return <SectionCard title={`${props.config.relationLabel} Wiring`} description={`Link each utility type primary key with one or more ${props.config.relationLabel.toLowerCase()} primary keys.`} action={<CreateActionDialog title={`Create ${props.config.relationLabel} Wiring`} triggerLabel="Create Wiring" submitLabel="Create" contentClassName="sm:max-w-xl" onCreate={() => saveWiring(props.vm, props.config, props.api, "create")}><WiringForm config={props.config} value={props.vm.wiringDraft} onChange={props.vm.setWiringDraft} relationOptions={props.vm.entityRows.filter((row: any) => row.status === 1)} utilityTypeOptions={props.vm.utilityTypeOptions} /></CreateActionDialog>}><div className="mb-4 space-y-3"><WiringFilterBar search={props.vm.wiringSearch} utilityTypeFilter={props.vm.utilityTypeFilter} statusFilter={props.vm.statusFilter} utilityTypeOptions={props.vm.utilityTypeOptions} onSearchChange={props.vm.setWiringSearch} onUtilityTypeChange={props.vm.setUtilityTypeFilter} onStatusChange={props.vm.setStatusFilter} onClear={() => { props.vm.setWiringSearch(""); props.vm.setUtilityTypeFilter("all"); props.vm.setStatusFilter("all"); }} /></div>{props.vm.loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}{!props.vm.loading && props.rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No wiring found.</div> : null}<DataTable rows={props.rows} columns={props.columns} rowKey={(row) => row.id} /></SectionCard>;
}

function EditDialogs(props: any) {
  return <><CreateActionDialog title={`Edit ${props.config.relationLabel}`} submitLabel="Save" hideTrigger open={Boolean(props.vm.entityEdit)} onOpenChange={(open) => !open && props.vm.setEntityEdit(null)} contentClassName="sm:max-w-xl" onCreate={() => saveEntity(props.vm, props.config.kind, "update")}>{props.vm.entityEdit ? <MasterEntityForm config={props.config} value={props.vm.entityEdit} onChange={props.vm.setEntityEdit} /> : null}</CreateActionDialog><CreateActionDialog title={`Edit ${props.config.relationLabel} Wiring`} submitLabel="Save" hideTrigger open={Boolean(props.vm.wiringEdit)} onOpenChange={(open) => !open && props.vm.setWiringEdit(null)} contentClassName="sm:max-w-xl" onCreate={() => saveWiring(props.vm, props.config, props.api, "update")}>{props.vm.wiringEdit ? <WiringForm config={props.config} value={props.vm.wiringEdit} onChange={props.vm.setWiringEdit} relationOptions={props.vm.entityRows.filter((row: any) => row.status === 1)} utilityTypeOptions={props.vm.utilityTypeOptions} /> : null}</CreateActionDialog></>;
}

function DeleteDialogs(props: any) {
  return <><ActionModal open={Boolean(props.vm.deleteEntityId)} onOpenChange={(open) => !open && props.vm.setDeleteEntityId(null)} title={`Delete ${props.config.relationLabel.toLowerCase()}?`} description={`This will remove the ${props.config.relationLabel.toLowerCase()} record from the database.`} confirmLabel="Delete" tone="destructive" onConfirm={() => deleteEntity(props.vm, props.config.kind)} /><ActionModal open={Boolean(props.vm.deleteWiringId)} onOpenChange={(open) => !open && props.vm.setDeleteWiringId(null)} title={`Delete ${props.config.relationLabel.toLowerCase()} wiring?`} description={`This will remove the relation between the utility type and ${props.config.relationLabel.toLowerCase()}.`} confirmLabel="Delete" tone="destructive" onConfirm={() => deleteWiring(props.vm, props.api)} /></>;
}

async function saveEntity(vm: any, kind: any, mode: "create" | "update") {
  const draft = mode === "create" ? vm.entityDraft : vm.entityEdit;
  if (!draft?.name?.trim()) return toast.error("Name is required."), false;
  const duplicate = (vm.entityRows as MasterEntityRow[]).some((row) => row.id !== draft.id && row.name.trim().toLowerCase() === draft.name.trim().toLowerCase());
  if (duplicate) return toast.error("Name already exists."), false;
  try { const saved = mode === "create" ? await createSettingsEntity(kind, draft, vm.userId) : await updateSettingsEntity(kind, draft, vm.userId); vm.setEntityRows((current: any[]) => mode === "create" ? [saved, ...current] : current.map((row) => row.id === saved.id ? saved : row)); if (mode === "update") vm.setEntityEdit(null); toast.success(mode === "create" ? "Created" : "Saved"); return true; } catch (error) { toast.error(error instanceof Error ? error.message : "Save failed."); return false; }
}

async function saveWiring(vm: any, config: MasterWiringConfig, api: MasterWiringApi, mode: "create" | "update") {
  const draft: WiringDraft = mode === "create" ? vm.wiringDraft : vm.wiringEdit;
  if (!draft?.utilityTypeId) return toast.error("Utility type is required."), false;
  if (!draft?.relationId) return toast.error(`${config.relationLabel} is required.`), false;
  const duplicate = (vm.wiringRows as MasterWiringRow[]).some((row) => row.id !== draft.id && row.utilityTypeId === draft.utilityTypeId && row.relationId === draft.relationId);
  if (duplicate) return toast.error("This wiring already exists."), false;
  try { const saved = mode === "create" ? await api.createWiring(draft, vm.userId) : await api.updateWiring(draft, vm.userId); vm.setWiringRows((current: any[]) => mode === "create" ? [saved, ...current] : current.map((row) => row.id === saved.id ? saved : row)); if (mode === "update") vm.setWiringEdit(null); toast.success(mode === "create" ? "Wiring created" : "Wiring updated"); return true; } catch (error) { toast.error(error instanceof Error ? error.message : "Save failed."); return false; }
}

async function deleteEntity(vm: any, kind: any) {
  if (!vm.deleteEntityId) return;
  await deleteSettingsEntity(kind, vm.deleteEntityId, vm.userId);
  vm.setEntityRows((current: any[]) => current.filter((row) => row.id !== vm.deleteEntityId));
  vm.setWiringRows((current: any[]) => current.filter((row) => row.relationId !== vm.deleteEntityId));
  toast.success("Deleted");
}

async function deleteWiring(vm: any, api: MasterWiringApi) {
  if (!vm.deleteWiringId) return;
  await api.deleteWiring(vm.deleteWiringId, vm.userId);
  vm.setWiringRows((current: any[]) => current.filter((row) => row.id !== vm.deleteWiringId));
  toast.success("Deleted");
}

