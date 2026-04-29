import { RefreshCw } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { Button } from "@/app/components/ui/button";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { DataTable } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { SectionCard } from "@/components/SectionCard";
import { buildUsersColumns } from "@/pages/settings/modules/users/users-columns";
import { DeleteConfirm } from "@/pages/settings/modules/users/delete-confirm";
import { UsersFilters } from "@/pages/settings/modules/users/users-filters";
import { UsersDetailView } from "@/pages/settings/modules/users/users-detail-view";
import { UserForm } from "@/pages/settings/modules/users/user-form";
import { firstError, validateUser } from "@/pages/settings/modules/users/form-helpers";
import { useUsersModule } from "@/pages/settings/modules/users/use-users-module";
import { deleteUser, resetUserPassword, updateUser } from "@/pages/settings/modules/usersApi";

export function UsersModule() {
  const vm = useUsersModule();
  const columns = buildUsersColumns(vm.state.roles);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void vm.loadUsers()} disabled={vm.state.loading}><RefreshCw className="size-4" /></Button>
        <CreateActionDialog title="Create user" triggerLabel="Create" submitLabel="Create" open={vm.createOpen} onOpenChange={vm.setCreateOpen} contentClassName="sm:max-w-2xl" onCreate={vm.submitCreate}>
          <UserForm value={vm.draft} onChange={(user) => { vm.setDraft(user); if (Object.keys(vm.createErrors).length) vm.setCreateErrors({}); }} employees={vm.state.employees} roles={vm.state.roles} companies={vm.state.companies} errors={vm.createErrors} />
        </CreateActionDialog>
      </div>

      <UsersFilters search={vm.search} companyId={vm.companyId} companies={vm.state.companies} onSearchChange={vm.setSearch} onCompanyChange={vm.setCompanyId} onClear={() => { vm.setSearch(""); vm.setCompanyId(undefined); }} />
      <SectionCard title="Users" description="Application accounts and access status.">
        {vm.state.loading ? <div className="p-4 text-sm text-muted-foreground">Loading users from database...</div> : null}
        {!vm.state.loading && vm.rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No users found.</div> : null}
        <DataTable rows={vm.rows} columns={columns} rowKey={(row) => row.id} onRowClick={(user) => { vm.setSelected(user); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} />
      </SectionCard>

      <DetailPanel open={Boolean(vm.selected)} onOpenChange={(open) => { if (open) return; vm.setSelected(null); vm.setEditDraft(null); vm.setEditErrors({}); vm.setConfirmDelete(false); }} title={vm.editDraft ? "Edit user" : "User"} description={vm.selected ? vm.selected.username || "New user" : undefined} overlay={vm.selected && vm.confirmDelete ? <DeleteConfirm label={vm.selected.username} onCancel={() => vm.setConfirmDelete(false)} onConfirm={async () => { await deleteUser(vm.selected!.id, vm.userId); vm.setConfirmDelete(false); vm.setEditDraft(null); vm.setSelected(null); toast.success("Deleted"); await vm.loadUsers(); }} /> : null}>
        {vm.selected ? <UsersDetailView selected={vm.selected} draft={vm.editDraft} errors={vm.editErrors} employees={vm.state.employees} roles={vm.state.roles} companies={vm.state.companies} onDraftChange={(user) => { vm.setEditDraft(user); if (Object.keys(vm.editErrors).length) vm.setEditErrors({}); }} onCancel={() => { vm.setEditDraft(null); vm.setEditErrors({}); }} onSave={() => void saveEdit(vm)} onDelete={() => vm.setConfirmDelete(true)} onResetPassword={() => void resetPassword(vm)} onEdit={() => { vm.setEditDraft({ ...vm.selected! }); vm.setEditErrors({}); }} /> : null}
      </DetailPanel>
    </div>
  );
}

async function saveEdit(vm: ReturnType<typeof useUsersModule>) {
  if (!vm.selected || !vm.editDraft) return;
  const errors = validateUser(vm.editDraft, vm.state.users, vm.selected.id);
  vm.setEditErrors(errors);
  const message = firstError(errors);
  if (message) return toast.error(message);
  try { const updated = await updateUser(vm.editDraft, vm.userId); vm.setSelected(updated); vm.setEditDraft(null); vm.setEditErrors({}); toast.success("Saved"); await vm.loadUsers(); } catch (error) { toast.error(error instanceof Error ? error.message : "User save failed"); }
}

async function resetPassword(vm: ReturnType<typeof useUsersModule>) {
  if (!vm.selected) return;
  try { const result = await resetUserPassword(vm.selected.id, vm.userId); toast.success(`Password reset to ${result.password}`); } catch (error) { toast.error(error instanceof Error ? error.message : "Password reset failed"); }
}
