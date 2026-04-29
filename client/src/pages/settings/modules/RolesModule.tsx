import { RefreshCw } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { Button } from "@/app/components/ui/button";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { DataTable } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SectionCard } from "@/components/SectionCard";
import { DeleteConfirm } from "@/pages/settings/modules/users/delete-confirm";
import { buildRoleColumns } from "@/pages/settings/modules/roles/columns";
import { RolesDetailView } from "@/pages/settings/modules/roles/detail-view";
import { RoleForm } from "@/pages/settings/modules/roles/form";
import { firstRoleError, validateRole } from "@/pages/settings/modules/roles/helpers";
import { useRolesModule } from "@/pages/settings/modules/roles/use-roles-module";
import { createRole, deleteRole, updateRole } from "@/pages/settings/modules/settingsEntityApi";

export function RolesModule() {
  const vm = useRolesModule();
  return <div className="space-y-4"><div className="flex items-center justify-end gap-2"><Button variant="outline" size="icon" onClick={() => void vm.loadRoles()} disabled={vm.loading}><RefreshCw className="size-4" /></Button><CreateActionDialog title="Create role" triggerLabel="Create" submitLabel="Create" open={vm.createOpen} onOpenChange={vm.setCreateOpen} contentClassName="sm:max-w-4xl" onCreate={() => createNewRole(vm)}><RoleForm value={vm.draft} onChange={(role) => { vm.setDraft(role); if (Object.keys(vm.createErrors).length) vm.setCreateErrors({}); }} permissions={vm.permissions} errors={vm.createErrors} /></CreateActionDialog></div><FilterBar left={<div className="w-full sm:w-[360px]"><SearchInput value={vm.search} onChange={vm.setSearch} placeholder="Search roles..." /></div>} onClear={() => vm.setSearch("")} /><SectionCard title="Roles" description="Roles define permissions. Assign roles to users.">{vm.loading ? <div className="p-4 text-sm text-muted-foreground">Loading roles from database...</div> : null}{!vm.loading && vm.rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No roles found.</div> : null}<DataTable rows={vm.rows} columns={buildRoleColumns()} rowKey={(row) => row.id} onRowClick={(role) => { vm.setSelected(role); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} /></SectionCard><DetailPanel open={Boolean(vm.selected)} onOpenChange={(open) => { if (open) return; vm.setSelected(null); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} title={vm.editDraft ? "Edit role" : "Role"} description={vm.selected ? vm.selected.name : undefined} overlay={vm.selected && vm.confirmDelete ? <DeleteConfirm label={vm.selected.name} onCancel={() => vm.setConfirmDelete(false)} onConfirm={async () => { await deleteRole(vm.selected!.id, vm.userId); vm.setConfirmDelete(false); vm.setEditDraft(null); vm.setSelected(null); toast.success("Deleted"); await vm.loadRoles(); }} /> : null}>{vm.selected ? <RolesDetailView selected={vm.selected} draft={vm.editDraft} permissions={vm.permissions} errors={vm.editErrors} onDraftChange={(role) => { vm.setEditDraft(role); if (Object.keys(vm.editErrors).length) vm.setEditErrors({}); }} onCancel={() => { vm.setEditDraft(null); vm.setEditErrors({}); }} onSave={() => void saveEdit(vm)} onDelete={() => vm.setConfirmDelete(true)} onEdit={() => { vm.setEditDraft({ ...vm.selected! }); vm.setEditErrors({}); }} /> : null}</DetailPanel></div>;
}

async function createNewRole(vm: ReturnType<typeof useRolesModule>) {
  const errors = validateRole(vm.draft, vm.roles);
  vm.setCreateErrors(errors);
  const message = firstRoleError(errors);
  if (message) return toast.error(message), false;
  try { const created = await createRole(vm.draft, vm.userId); vm.setRoles((rows) => [created, ...rows]); vm.setCreateErrors({}); toast.success("Role created"); return true; } catch (error) { toast.error(error instanceof Error ? error.message : "Role create failed"); return false; }
}

async function saveEdit(vm: ReturnType<typeof useRolesModule>) {
  if (!vm.selected || !vm.editDraft) return;
  const errors = validateRole(vm.editDraft, vm.roles, vm.selected.id);
  vm.setEditErrors(errors);
  const message = firstRoleError(errors);
  if (message) return toast.error(message);
  try { const updated = await updateRole(vm.editDraft, vm.userId); vm.setSelected(updated); vm.setEditDraft(null); vm.setEditErrors({}); toast.success("Saved"); await vm.loadRoles(); } catch (error) { toast.error(error instanceof Error ? error.message : "Role save failed"); }
}
