import { RefreshCw } from "lucide-react";
import { toast } from "@/core/app/lib/toast";

import { Button } from "@/components/ui/primitives/button";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { DataTable } from "@/components/table/DataTable";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { DeleteConfirm } from "@/features/admin/settings/modules/users/delete-confirm";
import { buildEntityManagerColumns } from "@/features/admin/settings/modules/entity-manager/columns";
import { EntityManagerDetailView } from "@/features/admin/settings/modules/entity-manager/detail-view";
import { EntityManagerForm } from "@/features/admin/settings/modules/entity-manager/form";
import { firstEntityError, validateEntity } from "@/features/admin/settings/modules/entity-manager/helpers";
import type { EntityManagerConfig } from "@/features/admin/settings/modules/entity-manager/types";
import { useEntityManager } from "@/features/admin/settings/modules/entity-manager/use-entity-manager";
import { createSettingsEntity, deleteSettingsEntity, updateSettingsEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";

export function ReferenceSettingsModule(config: EntityManagerConfig) {
  const vm = useEntityManager(config);
  return <div className="space-y-4"><div className="flex items-center justify-end gap-2"><Button variant="outline" size="icon" onClick={() => void vm.loadRows()} disabled={vm.loading}><RefreshCw className="size-4" /></Button><CreateActionDialog title={`Create ${config.noun.toLowerCase()}`} triggerLabel={`Create ${config.noun.toLowerCase()}`} triggerVariant="floating" submitLabel="Create" open={vm.createOpen} onOpenChange={vm.setCreateOpen} contentClassName="sm:max-w-xl" onCreate={() => createEntity(config, vm)}><EntityManagerForm value={vm.draft} onChange={(item) => { vm.setDraft(item); if (Object.keys(vm.createErrors).length) vm.setCreateErrors({}); }} label={config.noun} errors={vm.createErrors} /></CreateActionDialog></div><FilterBar left={<div className="w-full sm:w-[360px]"><SearchInput value={vm.search} onChange={vm.setSearch} placeholder={`Search ${config.title.toLowerCase()}...`} /></div>} onClear={() => vm.setSearch("")} /><SectionCard title={config.title} description={config.description}>{vm.loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}{!vm.loading && vm.filteredRows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No records found.</div> : null}<DataTable rows={vm.filteredRows} columns={buildEntityManagerColumns(config.noun)} rowKey={(row) => row.id} onRowClick={(item) => { vm.setSelected(item); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} /></SectionCard><DetailPanel open={Boolean(vm.selected)} onOpenChange={(open) => { if (open) return; vm.setSelected(null); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} title={vm.editDraft ? `Edit ${config.noun.toLowerCase()}` : config.noun} description={vm.selected ? vm.selected.name : undefined} overlay={vm.selected && vm.confirmDelete ? <DeleteConfirm label={vm.selected.name} onCancel={() => vm.setConfirmDelete(false)} onConfirm={async () => { await deleteSettingsEntity(config.kind, vm.selected!.id, vm.userId); vm.setConfirmDelete(false); vm.setEditDraft(null); vm.setSelected(null); toast.success("Deleted"); await vm.loadRows(); }} /> : null}>{vm.selected ? <EntityManagerDetailView selected={vm.selected} draft={vm.editDraft} noun={config.noun} errors={vm.editErrors} onDraftChange={(item) => { vm.setEditDraft(item); if (Object.keys(vm.editErrors).length) vm.setEditErrors({}); }} onCancel={() => { vm.setEditDraft(null); vm.setEditErrors({}); }} onSave={() => void saveEntity(config, vm)} onDelete={() => vm.setConfirmDelete(true)} onEdit={() => { vm.setEditDraft({ ...vm.selected! }); vm.setEditErrors({}); }} /> : null}</DetailPanel></div>;
}

async function createEntity(config: EntityManagerConfig, vm: ReturnType<typeof useEntityManager>) {
  const errors = validateEntity(vm.draft, vm.rows, config.noun);
  vm.setCreateErrors(errors);
  const message = firstEntityError(errors);
  if (message) return toast.error(message), false;
  try { const created = await createSettingsEntity(config.kind, vm.draft, vm.userId); vm.setRows((current) => [created, ...current]); vm.setCreateErrors({}); toast.success(`${config.noun} created`); return true; } catch (error) { toast.error(error instanceof Error ? error.message : "Create failed"); return false; }
}

async function saveEntity(config: EntityManagerConfig, vm: ReturnType<typeof useEntityManager>) {
  if (!vm.selected || !vm.editDraft) return;
  const errors = validateEntity(vm.editDraft, vm.rows, config.noun, vm.selected.id);
  vm.setEditErrors(errors);
  const message = firstEntityError(errors);
  if (message) return toast.error(message);
  try { const updated = await updateSettingsEntity(config.kind, vm.editDraft, vm.userId); vm.setSelected(updated); vm.setEditDraft(null); vm.setEditErrors({}); toast.success("Saved"); await vm.loadRows(); } catch (error) { toast.error(error instanceof Error ? error.message : "Save failed"); }
}


