import * as React from "react";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { SectionCard } from "@/components/SectionCard";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { ActionModal } from "@/components/ActionModal";
import { StatusBadge } from "@/components/StatusBadge";
import { useUser } from "@/app/state/user";
import {
  createSettingsEntity,
  deleteSettingsEntity,
  listSettingsEntities,
  updateSettingsEntity,
  type SettingsEntity,
} from "./settingsEntityApi";
import {
  createUomWiring,
  deleteUomWiring,
  listUomWiring,
  listUomWiringLookups,
  updateUomWiring,
  type UomWiringEntity,
  type UtilityTypeOption,
} from "./uomSettingsApi";

type UomForm = SettingsEntity;
type WiringForm = {
  id: string;
  uomId: string;
  utilityTypeId: string;
  status: 0 | 1;
};

function blankUom(): UomForm {
  return { id: "", name: "", status: 1 };
}

function blankWiring(): WiringForm {
  return { id: "", uomId: "", utilityTypeId: "", status: 1 };
}

function UomFormFields({
  value,
  onChange,
}: {
  value: UomForm;
  onChange: (next: UomForm) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">
          UOM name <span className="text-destructive">*</span>
        </div>
        <Input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} placeholder="UOM name" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">
          Status <span className="text-destructive">*</span>
        </div>
        <SelectFilter
          value={String(value.status)}
          onChange={(status) => onChange({ ...value, status: status === "0" ? 0 : 1 })}
          placeholder="Status"
          className="w-full"
          items={[
            { value: "1", label: "Active" },
            { value: "0", label: "Inactive" },
          ]}
        />
      </div>
    </div>
  );
}

function WiringFormFields({
  value,
  onChange,
  uomOptions,
  utilityTypeOptions,
}: {
  value: WiringForm;
  onChange: (next: WiringForm) => void;
  uomOptions: SettingsEntity[];
  utilityTypeOptions: UtilityTypeOption[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">
          Utility type <span className="text-destructive">*</span>
        </div>
        <SelectFilter
          value={value.utilityTypeId}
          onChange={(utilityTypeId) => onChange({ ...value, utilityTypeId })}
          placeholder="Select utility type"
          className="w-full"
          items={utilityTypeOptions.map((item) => ({ value: item.id, label: item.name }))}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">
          UOM <span className="text-destructive">*</span>
        </div>
        <SelectFilter
          value={value.uomId}
          onChange={(uomId) => onChange({ ...value, uomId })}
          placeholder="Select UOM"
          className="w-full"
          items={uomOptions.map((item) => ({ value: item.id, label: item.name }))}
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-xs text-muted-foreground">
          Status <span className="text-destructive">*</span>
        </div>
        <SelectFilter
          value={String(value.status)}
          onChange={(status) => onChange({ ...value, status: status === "0" ? 0 : 1 })}
          placeholder="Status"
          className="w-full"
          items={[
            { value: "1", label: "Active" },
            { value: "0", label: "Inactive" },
          ]}
        />
      </div>
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" size="icon" variant="outline" onClick={onEdit}>
        <Pencil className="size-4" />
      </Button>
      <Button type="button" size="icon" variant="outline" onClick={onDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function UomSettingsModule() {
  const { userId } = useUser();
  const [search, setSearch] = React.useState("");
  const [wiringSearch, setWiringSearch] = React.useState("");
  const [wiringUtilityTypeFilter, setWiringUtilityTypeFilter] = React.useState("all");
  const [wiringStatusFilter, setWiringStatusFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [uomRows, setUomRows] = React.useState<SettingsEntity[]>([]);
  const [wiringRows, setWiringRows] = React.useState<UomWiringEntity[]>([]);
  const [utilityTypeOptions, setUtilityTypeOptions] = React.useState<UtilityTypeOption[]>([]);
  const [createUomOpen, setCreateUomOpen] = React.useState(false);
  const [createWiringOpen, setCreateWiringOpen] = React.useState(false);
  const [uomDraft, setUomDraft] = React.useState<UomForm>(blankUom());
  const [wiringDraft, setWiringDraft] = React.useState<WiringForm>(blankWiring());
  const [uomEdit, setUomEdit] = React.useState<UomForm | null>(null);
  const [wiringEdit, setWiringEdit] = React.useState<WiringForm | null>(null);
  const [deleteUomId, setDeleteUomId] = React.useState<string | null>(null);
  const [deleteWiringId, setDeleteWiringId] = React.useState<string | null>(null);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const [uoms, wiring, lookups] = await Promise.all([
        listSettingsEntities("uom", userId),
        listUomWiring(userId),
        listUomWiringLookups(userId),
      ]);
      setUomRows(uoms);
      setWiringRows(wiring);
      setUtilityTypeOptions(lookups.utilityTypeOptions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load UOM settings.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  React.useEffect(() => {
    if (createUomOpen) setUomDraft(blankUom());
  }, [createUomOpen]);

  React.useEffect(() => {
    if (createWiringOpen) setWiringDraft(blankWiring());
  }, [createWiringOpen]);

  const filteredUomRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return uomRows.filter((row) => (!q ? true : row.name.toLowerCase().includes(q)));
  }, [uomRows, search]);

  const filteredWiringRows = React.useMemo(() => {
    const q = wiringSearch.trim().toLowerCase();
    return wiringRows.filter((row) =>
      (!q
        ? true
        : row.uomName.toLowerCase().includes(q) ||
          row.utilityTypeName.toLowerCase().includes(q) ||
          row.utilityTypeKey.toLowerCase().includes(q)) &&
      (wiringUtilityTypeFilter === "all" ? true : row.utilityTypeId === wiringUtilityTypeFilter) &&
      (wiringStatusFilter === "all" ? true : String(row.status) === wiringStatusFilter),
    );
  }, [wiringRows, wiringSearch, wiringUtilityTypeFilter, wiringStatusFilter]);

  function validateUom(item: UomForm, currentId?: string) {
    const name = item.name.trim().toLowerCase();
    if (!name) return "UOM name is required.";
    if (uomRows.some((row) => row.id !== currentId && row.name.trim().toLowerCase() === name)) {
      return "UOM name already exists.";
    }
    return null;
  }

  function validateWiring(item: WiringForm, currentId?: string) {
    if (!item.utilityTypeId) return "Utility type is required.";
    if (!item.uomId) return "UOM is required.";
    if (
      wiringRows.some(
        (row) =>
          row.id !== currentId && row.utilityTypeId === item.utilityTypeId && row.uomId === item.uomId,
      )
    ) {
      return "This UOM wiring already exists.";
    }
    return null;
  }

  const uomColumns: Array<DataColumn<SettingsEntity>> = [
    {
      id: "name",
      header: "UOM",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{row.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">ID {row.id}</div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={row.status === 1 ? "compliant" : "neutral"}>
          {row.status === 1 ? "active" : "inactive"}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <RowActions
          onEdit={() => setUomEdit({ ...row })}
          onDelete={() => setDeleteUomId(row.id)}
        />
      ),
    },
  ];

  const wiringColumns: Array<DataColumn<UomWiringEntity>> = [
    {
      id: "utilityType",
      header: "Utility Type",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{row.utilityTypeName}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{row.utilityTypeKey}</div>
        </div>
      ),
    },
    {
      id: "uom",
      header: "UOM",
      cell: (row) => <div className="text-sm font-medium">{row.uomName}</div>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={row.status === 1 ? "compliant" : "neutral"}>
          {row.status === 1 ? "active" : "inactive"}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <RowActions
          onEdit={() =>
            setWiringEdit({
              id: row.id,
              uomId: row.uomId,
              utilityTypeId: row.utilityTypeId,
              status: row.status,
            })
          }
          onDelete={() => setDeleteWiringId(row.id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <div className="w-full sm:w-[360px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search UOM or wiring..." />
          </div>
        }
        right={
          <Button variant="outline" size="icon" onClick={() => void loadAll()} disabled={loading}>
            <RefreshCw className="size-4" />
          </Button>
        }
        onClear={() => setSearch("")}
      />

      <SectionCard
        title="UOM"
        description="Create and maintain unit of measure master records."
        action={
          <CreateActionDialog
            title="Create UOM"
            triggerLabel="Create UOM"
            submitLabel="Create"
            open={createUomOpen}
            onOpenChange={setCreateUomOpen}
            contentClassName="sm:max-w-xl"
            onCreate={async () => {
              const error = validateUom(uomDraft);
              if (error) return toast.error(error), false;
              try {
                const created = await createSettingsEntity("uom", uomDraft, userId);
                setUomRows((current) => [created, ...current]);
                toast.success("UOM created");
                return true;
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Create failed.");
                return false;
              }
            }}
          >
            <UomFormFields value={uomDraft} onChange={setUomDraft} />
          </CreateActionDialog>
        }
      >
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}
        {!loading && filteredUomRows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No UOM found.</div> : null}
        <DataTable rows={filteredUomRows} columns={uomColumns} rowKey={(row) => row.id} />
      </SectionCard>

      <SectionCard
        title="UOM Wiring"
        description="Link each utility type primary key with one or more UOM primary keys."
        action={
          <CreateActionDialog
            title="Create UOM Wiring"
            triggerLabel="Create Wiring"
            submitLabel="Create"
            open={createWiringOpen}
            onOpenChange={setCreateWiringOpen}
            contentClassName="sm:max-w-xl"
            onCreate={async () => {
              const error = validateWiring(wiringDraft);
              if (error) return toast.error(error), false;
              try {
                const created = await createUomWiring(wiringDraft, userId);
                setWiringRows((current) => [created, ...current]);
                toast.success("UOM wiring created");
                return true;
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Create failed.");
                return false;
              }
            }}
          >
            <WiringFormFields
              value={wiringDraft}
              onChange={setWiringDraft}
              uomOptions={uomRows.filter((row) => row.status === 1)}
              utilityTypeOptions={utilityTypeOptions}
            />
          </CreateActionDialog>
        }
      >
        <div className="mb-4 space-y-3">
          <FilterBar
            left={
              <div className="w-full sm:w-[280px]">
                <SearchInput value={wiringSearch} onChange={setWiringSearch} placeholder="Search wiring..." />
              </div>
            }
            right={
              <>
                <SelectFilter
                  value={wiringUtilityTypeFilter}
                  onChange={setWiringUtilityTypeFilter}
                  placeholder="Utility type"
                  className="w-full sm:w-[200px]"
                  items={[
                    { value: "all", label: "All utility types" },
                    ...utilityTypeOptions.map((item) => ({ value: item.id, label: item.name })),
                  ]}
                />
                <SelectFilter
                  value={wiringStatusFilter}
                  onChange={setWiringStatusFilter}
                  placeholder="Status"
                  className="w-full sm:w-[160px]"
                  items={[
                    { value: "all", label: "All status" },
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                />
              </>
            }
            onClear={() => {
              setWiringSearch("");
              setWiringUtilityTypeFilter("all");
              setWiringStatusFilter("all");
            }}
            className="rounded-lg"
          />
        </div>
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}
        {!loading && filteredWiringRows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No wiring found.</div> : null}
        <DataTable rows={filteredWiringRows} columns={wiringColumns} rowKey={(row) => row.id} />
      </SectionCard>

      <CreateActionDialog
        title="Edit UOM"
        submitLabel="Save"
        hideTrigger
        open={Boolean(uomEdit)}
        onOpenChange={(open) => {
          if (!open) setUomEdit(null);
        }}
        contentClassName="sm:max-w-xl"
        onCreate={async () => {
          if (!uomEdit) return false;
          const error = validateUom(uomEdit, uomEdit.id);
          if (error) return toast.error(error), false;
          try {
            const updated = await updateSettingsEntity("uom", uomEdit, userId);
            setUomRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
            toast.success("UOM updated");
            return true;
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed.");
            return false;
          }
        }}
      >
        {uomEdit ? <UomFormFields value={uomEdit} onChange={setUomEdit} /> : null}
      </CreateActionDialog>

      <CreateActionDialog
        title="Edit UOM Wiring"
        submitLabel="Save"
        hideTrigger
        open={Boolean(wiringEdit)}
        onOpenChange={(open) => {
          if (!open) setWiringEdit(null);
        }}
        contentClassName="sm:max-w-xl"
        onCreate={async () => {
          if (!wiringEdit) return false;
          const error = validateWiring(wiringEdit, wiringEdit.id);
          if (error) return toast.error(error), false;
          try {
            const updated = await updateUomWiring(wiringEdit, userId);
            setWiringRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
            toast.success("UOM wiring updated");
            return true;
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed.");
            return false;
          }
        }}
      >
        {wiringEdit ? (
          <WiringFormFields
            value={wiringEdit}
            onChange={setWiringEdit}
            uomOptions={uomRows.filter((row) => row.status === 1)}
            utilityTypeOptions={utilityTypeOptions}
          />
        ) : null}
      </CreateActionDialog>

      <ActionModal
        open={Boolean(deleteUomId)}
        onOpenChange={(open) => {
          if (!open) setDeleteUomId(null);
        }}
        title="Delete UOM?"
        description="This will remove the UOM record from the database."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={async () => {
          if (!deleteUomId) return;
          await deleteSettingsEntity("uom", deleteUomId, userId);
          setUomRows((current) => current.filter((row) => row.id !== deleteUomId));
          setWiringRows((current) => current.filter((row) => row.uomId !== deleteUomId));
          toast.success("UOM deleted");
        }}
      />

      <ActionModal
        open={Boolean(deleteWiringId)}
        onOpenChange={(open) => {
          if (!open) setDeleteWiringId(null);
        }}
        title="Delete UOM wiring?"
        description="This will remove the relation between the utility type and UOM."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={async () => {
          if (!deleteWiringId) return;
          await deleteUomWiring(deleteWiringId, userId);
          setWiringRows((current) => current.filter((row) => row.id !== deleteWiringId));
          toast.success("UOM wiring deleted");
        }}
      />
    </div>
  );
}
