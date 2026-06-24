import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { DataTable } from "@/components/table/DataTable";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { toast } from "@/core/app/lib/toast";
import { buildRoleColumns } from "@/features/admin/settings/modules/roles/columns";
import { RolesDetailView } from "@/features/admin/settings/modules/roles/detail-view";
import { RoleForm } from "@/features/admin/settings/modules/roles/form";
import { firstRoleError, validateRole } from "@/features/admin/settings/modules/roles/helpers";
import { useRolesModule } from "@/features/admin/settings/modules/roles/use-roles-module";
import { createRole, deleteRole, updateRole } from "@/features/admin/settings/modules/services/settingsEntityApi";
import { DeleteConfirm } from "@/features/admin/settings/modules/users/delete-confirm";

type RolesModuleVm = ReturnType<typeof useRolesModule>;

export function RolesModule() {
  const vm = useRolesModule();

  return (
    <div className="space-y-4">
      <RolesActionsBar vm={vm} />
      <RolesFilters vm={vm} />
      <RolesTable vm={vm} />
      <RolesDetailPanel vm={vm} />
    </div>
  );
}

function RolesActionsBar(props: { vm: RolesModuleVm }) {
  const { vm } = props;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => void vm.loadRoles()}
        disabled={vm.loading}
      >
        <RefreshCw className="size-4" />
      </Button>
      <CreateActionDialog
        title="Create role"
        triggerLabel="Create role"
        triggerVariant="floating"
        submitLabel="Create"
        open={vm.createOpen}
        onOpenChange={vm.setCreateOpen}
        contentClassName="sm:max-w-4xl"
        onCreate={() => createNewRole(vm)}
      >
        <RoleForm
          value={vm.draft}
          onChange={(role) => {
            vm.setDraft(role);
            if (Object.keys(vm.createErrors).length) {
              vm.setCreateErrors({});
            }
          }}
          permissions={vm.permissions}
          errors={vm.createErrors}
        />
      </CreateActionDialog>
    </div>
  );
}

function RolesFilters(props: { vm: RolesModuleVm }) {
  const { vm } = props;

  return (
    <FilterBar
      left={(
        <div className="w-full sm:w-[360px]">
          <SearchInput
            value={vm.search}
            onChange={vm.setSearch}
            placeholder="Search roles..."
          />
        </div>
      )}
      onClear={() => vm.setSearch("")}
    />
  );
}

function RolesTable(props: { vm: RolesModuleVm }) {
  const { vm } = props;

  return (
    <SectionCard title="Roles" description="Roles define permissions. Assign roles to users.">
      {vm.loading ? (
        <div className="p-4 text-sm text-muted-foreground">
          Loading roles from database...
        </div>
      ) : null}
      {!vm.loading && vm.rows.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No roles found.
        </div>
      ) : null}
      <DataTable
        rows={vm.rows}
        columns={buildRoleColumns()}
        rowKey={(row) => row.id}
        onRowClick={(role) => {
          vm.setSelected(role);
          vm.setEditDraft(null);
          vm.setEditErrors({});
          vm.setConfirmDelete(false);
        }}
      />
    </SectionCard>
  );
}

function RolesDetailPanel(props: { vm: RolesModuleVm }) {
  const { vm } = props;
  const selected = vm.selected;

  return (
    <DetailPanel
      open={Boolean(selected)}
      onOpenChange={(open) => {
        if (open) return;
        vm.setSelected(null);
        vm.setEditDraft(null);
        vm.setEditErrors({});
        vm.setConfirmDelete(false);
      }}
      title={vm.editDraft ? "Edit role" : "Role"}
      description={selected?.name}
      overlay={selected && vm.confirmDelete ? (
        <DeleteConfirm
          label={selected.name}
          onCancel={() => vm.setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteRole(selected.id, vm.userId);
            vm.setConfirmDelete(false);
            vm.setEditDraft(null);
            vm.setSelected(null);
            toast.success("Deleted");
            await vm.loadRoles();
          }}
        />
      ) : null}
    >
      {selected ? (
        <RolesDetailView
          selected={selected}
          draft={vm.editDraft}
          permissions={vm.permissions}
          errors={vm.editErrors}
          onDraftChange={(role) => {
            vm.setEditDraft(role);
            if (Object.keys(vm.editErrors).length) {
              vm.setEditErrors({});
            }
          }}
          onCancel={() => {
            vm.setEditDraft(null);
            vm.setEditErrors({});
          }}
          onSave={() => void saveEdit(vm)}
          onDelete={() => vm.setConfirmDelete(true)}
          onEdit={() => {
            vm.setEditDraft({ ...selected });
            vm.setEditErrors({});
          }}
        />
      ) : null}
    </DetailPanel>
  );
}

async function createNewRole(vm: RolesModuleVm) {
  const errors = validateRole(vm.draft, vm.roles);
  vm.setCreateErrors(errors);

  const message = firstRoleError(errors);
  if (message) {
    toast.error(message);
    return false;
  }

  try {
    const created = await createRole(vm.draft, vm.userId);
    vm.setRoles((rows) => [created, ...rows]);
    vm.setCreateErrors({});
    toast.success("Role created");
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Role create failed");
    return false;
  }
}

async function saveEdit(vm: RolesModuleVm) {
  if (!vm.selected || !vm.editDraft) return;

  const errors = validateRole(vm.editDraft, vm.roles, vm.selected.id);
  vm.setEditErrors(errors);

  const message = firstRoleError(errors);
  if (message) {
    toast.error(message);
    return;
  }

  try {
    const updated = await updateRole(vm.editDraft, vm.userId);
    vm.setSelected(updated);
    vm.setEditDraft(null);
    vm.setEditErrors({});
    toast.success("Saved");
    await vm.loadRoles();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Role save failed");
  }
}
