import { RefreshCw } from "lucide-react";

import { ActionModal } from "@/components/feedback/ActionModal";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/primitives/button";
import { toast } from "@/core/app/lib/toast";
import { buildEntityColumns, buildWiringColumns } from "@/features/admin/settings/modules/master-wiring/columns";
import { EntityFilterBar, WiringFilterBar } from "@/features/admin/settings/modules/master-wiring/filters";
import { MasterEntityForm, WiringForm } from "@/features/admin/settings/modules/master-wiring/forms";
import type {
  MasterWiringApi,
  MasterWiringConfig,
  MasterWiringVm,
  WiringDraft,
  WiringRow,
} from "@/features/admin/settings/modules/master-wiring/types";
import { useMasterWiring } from "@/features/admin/settings/modules/master-wiring/use-master-wiring";
import type { SettingsEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";

type MasterWiringModuleProps = {
  config: MasterWiringConfig;
  api: MasterWiringApi;
};

type MasterEntityRow = Pick<SettingsEntity, "id" | "name" | "status">;

type WiringDialogProps = {
  config: MasterWiringConfig;
  api: MasterWiringApi;
  vm: MasterWiringVm;
};

export function MasterWiringModule(props: MasterWiringModuleProps) {
  const vm = useMasterWiring(props.api);
  const entityRows = filterEntityRows(vm.entityRows, vm.search);
  const wiringRows = filterWiringRows(vm.wiringRows, vm);

  return (
    <div className="space-y-4">
      <EntityFilterBar
        search={vm.search}
        onSearchChange={vm.setSearch}
        refreshAction={(
          <Button
            variant="outline"
            size="icon"
            onClick={() => void vm.loadAll()}
            disabled={vm.loading}
          >
            <RefreshCw className="size-4" />
          </Button>
        )}
        onClear={() => vm.setSearch("")}
      />
      <MasterSection
        config={props.config}
        api={props.api}
        vm={vm}
        rows={entityRows}
      />
      <WiringSection
        config={props.config}
        api={props.api}
        vm={vm}
        rows={wiringRows}
      />
      <EditDialogs config={props.config} api={props.api} vm={vm} />
      <DeleteDialogs config={props.config} api={props.api} vm={vm} />
    </div>
  );
}

function MasterSection(props: {
  config: MasterWiringConfig;
  api: MasterWiringApi;
  vm: MasterWiringVm;
  rows: MasterEntityRow[];
}) {
  const columns = buildEntityColumns(props.config, {
    onEdit: props.vm.setEntityEdit,
    onDelete: props.vm.setDeleteEntityId,
  });

  return (
    <SectionCard
      title={props.config.relationLabel}
      description={`Create and maintain ${props.config.relationLabel.toLowerCase()} master records.`}
      action={(
        <CreateActionDialog
          title={`Create ${props.config.relationLabel}`}
          triggerLabel={`Create ${props.config.relationLabel}`}
          submitLabel="Create"
          contentClassName="sm:max-w-xl"
          onCreate={() => saveEntity(props.vm, props.api, "create")}
        >
          <MasterEntityForm
            config={props.config}
            value={props.vm.entityDraft}
            onChange={props.vm.setEntityDraft}
          />
        </CreateActionDialog>
      )}
    >
      {props.vm.loading ? (
        <div className="p-4 text-sm text-muted-foreground">
          Loading from database...
        </div>
      ) : null}
      {!props.vm.loading && props.rows.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No {props.config.relationLabel.toLowerCase()} found.
        </div>
      ) : null}
      <DataTable rows={props.rows} columns={columns} rowKey={(row) => row.id} />
    </SectionCard>
  );
}

function WiringSection(props: {
  config: MasterWiringConfig;
  api: MasterWiringApi;
  vm: MasterWiringVm;
  rows: WiringRow[];
}) {
  const columns = buildWiringColumns({
    onEdit: props.vm.setWiringEdit,
    onDelete: props.vm.setDeleteWiringId,
  });
  const activeEntityRows = props.vm.entityRows.filter((row) => row.status === 1);

  return (
    <SectionCard
      title={`${props.config.relationLabel} Wiring`}
      description={`Link each utility type primary key with one or more ${props.config.relationLabel.toLowerCase()} primary keys.`}
      action={(
        <CreateActionDialog
          title={`Create ${props.config.relationLabel} Wiring`}
          triggerLabel="Create Wiring"
          submitLabel="Create"
          contentClassName="sm:max-w-xl"
          onCreate={() => saveWiring(props.vm, props.config, props.api, "create")}
        >
          <WiringForm
            config={props.config}
            value={props.vm.wiringDraft}
            onChange={props.vm.setWiringDraft}
            relationOptions={activeEntityRows}
            utilityTypeOptions={props.vm.utilityTypeOptions}
          />
        </CreateActionDialog>
      )}
    >
      <div className="mb-4 space-y-3">
        <WiringFilterBar
          search={props.vm.wiringSearch}
          utilityTypeFilter={props.vm.utilityTypeFilter}
          statusFilter={props.vm.statusFilter}
          utilityTypeOptions={props.vm.utilityTypeOptions}
          onSearchChange={props.vm.setWiringSearch}
          onUtilityTypeChange={props.vm.setUtilityTypeFilter}
          onStatusChange={props.vm.setStatusFilter}
          onClear={() => {
            props.vm.setWiringSearch("");
            props.vm.setUtilityTypeFilter("all");
            props.vm.setStatusFilter("all");
          }}
        />
      </div>
      {props.vm.loading ? (
        <div className="p-4 text-sm text-muted-foreground">
          Loading from database...
        </div>
      ) : null}
      {!props.vm.loading && props.rows.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">No wiring found.</div>
      ) : null}
      <DataTable rows={props.rows} columns={columns} rowKey={(row) => row.id} />
    </SectionCard>
  );
}

function EditDialogs(props: WiringDialogProps) {
  const activeEntityRows = props.vm.entityRows.filter((row) => row.status === 1);

  return (
    <>
      <CreateActionDialog
        title={`Edit ${props.config.relationLabel}`}
        submitLabel="Save"
        hideTrigger
        open={Boolean(props.vm.entityEdit)}
        onOpenChange={(open) => {
          if (!open) props.vm.setEntityEdit(null);
        }}
        contentClassName="sm:max-w-xl"
        onCreate={() => saveEntity(props.vm, props.api, "update")}
      >
        {props.vm.entityEdit ? (
          <MasterEntityForm
            config={props.config}
            value={props.vm.entityEdit}
            onChange={props.vm.setEntityEdit}
          />
        ) : null}
      </CreateActionDialog>
      <CreateActionDialog
        title={`Edit ${props.config.relationLabel} Wiring`}
        submitLabel="Save"
        hideTrigger
        open={Boolean(props.vm.wiringEdit)}
        onOpenChange={(open) => {
          if (!open) props.vm.setWiringEdit(null);
        }}
        contentClassName="sm:max-w-xl"
        onCreate={() => saveWiring(props.vm, props.config, props.api, "update")}
      >
        {props.vm.wiringEdit ? (
          <WiringForm
            config={props.config}
            value={props.vm.wiringEdit}
            onChange={props.vm.setWiringEdit}
            relationOptions={activeEntityRows}
            utilityTypeOptions={props.vm.utilityTypeOptions}
          />
        ) : null}
      </CreateActionDialog>
    </>
  );
}

function DeleteDialogs(props: WiringDialogProps) {
  return (
    <>
      <ActionModal
        open={Boolean(props.vm.deleteEntityId)}
        onOpenChange={(open) => {
          if (!open) props.vm.setDeleteEntityId(null);
        }}
        title={`Delete ${props.config.relationLabel.toLowerCase()}?`}
        description={`This will remove the ${props.config.relationLabel.toLowerCase()} record from the database.`}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={() => deleteEntity(props.vm, props.api)}
      />
      <ActionModal
        open={Boolean(props.vm.deleteWiringId)}
        onOpenChange={(open) => {
          if (!open) props.vm.setDeleteWiringId(null);
        }}
        title={`Delete ${props.config.relationLabel.toLowerCase()} wiring?`}
        description={`This will remove the relation between the utility type and ${props.config.relationLabel.toLowerCase()}.`}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={() => deleteWiring(props.vm, props.api)}
      />
    </>
  );
}

function filterEntityRows(rows: SettingsEntity[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return rows;
  }

  return rows.filter((row) => row.name.toLowerCase().includes(query));
}

function filterWiringRows(rows: WiringRow[], vm: MasterWiringVm) {
  const query = vm.wiringSearch.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      !query ||
      `${row.relationName} ${row.utilityTypeName} ${row.utilityTypeKey}`
        .toLowerCase()
        .includes(query);
    const matchesUtilityType =
      vm.utilityTypeFilter === "all" || row.utilityTypeId === vm.utilityTypeFilter;
    const matchesStatus =
      vm.statusFilter === "all" || String(row.status) === vm.statusFilter;

    return matchesSearch && matchesUtilityType && matchesStatus;
  });
}

async function saveEntity(
  vm: MasterWiringVm,
  api: MasterWiringApi,
  mode: "create" | "update",
) {
  const draft = mode === "create" ? vm.entityDraft : vm.entityEdit;

  if (!draft?.name?.trim()) {
    toast.error("Name is required.");
    return false;
  }

  const duplicate = vm.entityRows.some(
    (row) =>
      row.id !== draft.id &&
      row.name.trim().toLowerCase() === draft.name.trim().toLowerCase(),
  );
  if (duplicate) {
    toast.error("Name already exists.");
    return false;
  }

  try {
    const payload = {
      ...draft,
      name: draft.name.trim(),
    };
    const saved = mode === "create"
      ? await api.createEntity(payload, vm.userId)
      : await api.updateEntity(payload, vm.userId);
    vm.setEntityRows((current) =>
      mode === "create"
        ? [saved, ...current]
        : current.map((row) => (row.id === saved.id ? saved : row)),
    );
    if (mode === "update") {
      vm.setEntityEdit(null);
    }
    toast.success(mode === "create" ? "Created" : "Saved");
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Save failed.");
    return false;
  }
}

async function saveWiring(
  vm: MasterWiringVm,
  config: MasterWiringConfig,
  api: MasterWiringApi,
  mode: "create" | "update",
) {
  const draft: WiringDraft | null = mode === "create" ? vm.wiringDraft : vm.wiringEdit;

  if (!draft?.utilityTypeId) {
    toast.error("Utility type is required.");
    return false;
  }
  if (!draft.relationId) {
    toast.error(`${config.relationLabel} is required.`);
    return false;
  }

  const duplicate = vm.wiringRows.some(
    (row) =>
      row.id !== draft.id &&
      row.utilityTypeId === draft.utilityTypeId &&
      row.relationId === draft.relationId,
  );
  if (duplicate) {
    toast.error("This wiring already exists.");
    return false;
  }

  try {
    const saved = mode === "create"
      ? await api.createWiring(draft, vm.userId)
      : await api.updateWiring(draft, vm.userId);
    vm.setWiringRows((current) =>
      mode === "create"
        ? [saved, ...current]
        : current.map((row) => (row.id === saved.id ? saved : row)),
    );
    if (mode === "update") {
      vm.setWiringEdit(null);
    }
    toast.success(mode === "create" ? "Wiring created" : "Wiring updated");
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Save failed.");
    return false;
  }
}

async function deleteEntity(
  vm: MasterWiringVm,
  api: MasterWiringApi,
) {
  if (!vm.deleteEntityId) return;

  await api.deleteEntity(vm.deleteEntityId, vm.userId);
  vm.setEntityRows((current) =>
    current.filter((row) => row.id !== vm.deleteEntityId),
  );
  vm.setWiringRows((current) =>
    current.filter((row) => row.relationId !== vm.deleteEntityId),
  );
  vm.setDeleteEntityId(null);
  toast.success("Deleted");
}

async function deleteWiring(vm: MasterWiringVm, api: MasterWiringApi) {
  if (!vm.deleteWiringId) return;

  await api.deleteWiring(vm.deleteWiringId, vm.userId);
  vm.setWiringRows((current) =>
    current.filter((row) => row.id !== vm.deleteWiringId),
  );
  vm.setDeleteWiringId(null);
  toast.success("Deleted");
}
