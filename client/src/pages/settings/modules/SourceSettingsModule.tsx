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
  createSourceWiring,
  deleteSourceWiring,
  listSourceWiring,
  listSourceWiringLookups,
  updateSourceWiring,
  type SourceWiringEntity,
  type UtilityTypeOption,
} from "./uomSettingsApi";

type SourceForm = SettingsEntity;
type WiringForm = {
  id: string;
  sourceId: string;
  utilityTypeId: string;
  status: 0 | 1;
};

function blankSource(): SourceForm {
  return { id: "", name: "", status: 1 };
}

function blankWiring(): WiringForm {
  return { id: "", sourceId: "", utilityTypeId: "", status: 1 };
}

function SourceFormFields({ value, onChange }: { value: SourceForm; onChange: (next: SourceForm) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Source name <span className="text-destructive">*</span></div>
        <Input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} placeholder="Source name" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Status <span className="text-destructive">*</span></div>
        <SelectFilter
          value={String(value.status)}
          onChange={(status) => onChange({ ...value, status: status === "0" ? 0 : 1 })}
          placeholder="Status"
          className="w-full"
          items={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]}
        />
      </div>
    </div>
  );
}

function WiringFormFields({
  value,
  onChange,
  sourceOptions,
  utilityTypeOptions,
}: {
  value: WiringForm;
  onChange: (next: WiringForm) => void;
  sourceOptions: SettingsEntity[];
  utilityTypeOptions: UtilityTypeOption[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Utility type <span className="text-destructive">*</span></div>
        <SelectFilter
          value={value.utilityTypeId}
          onChange={(utilityTypeId) => onChange({ ...value, utilityTypeId })}
          placeholder="Select utility type"
          className="w-full"
          items={utilityTypeOptions.map((item) => ({ value: item.id, label: item.name }))}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Source <span className="text-destructive">*</span></div>
        <SelectFilter
          value={value.sourceId}
          onChange={(sourceId) => onChange({ ...value, sourceId })}
          placeholder="Select source"
          className="w-full"
          items={sourceOptions.map((item) => ({ value: item.id, label: item.name }))}
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-xs text-muted-foreground">Status <span className="text-destructive">*</span></div>
        <SelectFilter
          value={String(value.status)}
          onChange={(status) => onChange({ ...value, status: status === "0" ? 0 : 1 })}
          placeholder="Status"
          className="w-full"
          items={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]}
        />
      </div>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" size="icon" variant="outline" onClick={onEdit}><Pencil className="size-4" /></Button>
      <Button type="button" size="icon" variant="outline" onClick={onDelete}><Trash2 className="size-4" /></Button>
    </div>
  );
}

export function SourceSettingsModule() {
  const { userId } = useUser();
  const [search, setSearch] = React.useState("");
  const [wiringSearch, setWiringSearch] = React.useState("");
  const [wiringUtilityTypeFilter, setWiringUtilityTypeFilter] = React.useState("all");
  const [wiringStatusFilter, setWiringStatusFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [sourceRows, setSourceRows] = React.useState<SettingsEntity[]>([]);
  const [wiringRows, setWiringRows] = React.useState<SourceWiringEntity[]>([]);
  const [utilityTypeOptions, setUtilityTypeOptions] = React.useState<UtilityTypeOption[]>([]);
  const [createSourceOpen, setCreateSourceOpen] = React.useState(false);
  const [createWiringOpen, setCreateWiringOpen] = React.useState(false);
  const [sourceDraft, setSourceDraft] = React.useState<SourceForm>(blankSource());
  const [wiringDraft, setWiringDraft] = React.useState<WiringForm>(blankWiring());
  const [sourceEdit, setSourceEdit] = React.useState<SourceForm | null>(null);
  const [wiringEdit, setWiringEdit] = React.useState<WiringForm | null>(null);
  const [deleteSourceId, setDeleteSourceId] = React.useState<string | null>(null);
  const [deleteWiringId, setDeleteWiringId] = React.useState<string | null>(null);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const [sources, wiring, lookups] = await Promise.all([
        listSettingsEntities("sources", userId),
        listSourceWiring(userId),
        listSourceWiringLookups(userId),
      ]);
      setSourceRows(sources);
      setWiringRows(wiring);
      setUtilityTypeOptions(lookups.utilityTypeOptions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load source settings.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => { void loadAll(); }, [loadAll]);
  React.useEffect(() => { if (createSourceOpen) setSourceDraft(blankSource()); }, [createSourceOpen]);
  React.useEffect(() => { if (createWiringOpen) setWiringDraft(blankWiring()); }, [createWiringOpen]);

  const filteredSourceRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return sourceRows.filter((row) => (!q ? true : row.name.toLowerCase().includes(q)));
  }, [sourceRows, search]);

  const filteredWiringRows = React.useMemo(() => {
    const q = wiringSearch.trim().toLowerCase();
    return wiringRows.filter((row) =>
      (!q ? true : row.sourceName.toLowerCase().includes(q) || row.utilityTypeName.toLowerCase().includes(q) || row.utilityTypeKey.toLowerCase().includes(q)) &&
      (wiringUtilityTypeFilter === "all" ? true : row.utilityTypeId === wiringUtilityTypeFilter) &&
      (wiringStatusFilter === "all" ? true : String(row.status) === wiringStatusFilter),
    );
  }, [wiringRows, wiringSearch, wiringUtilityTypeFilter, wiringStatusFilter]);

  function validateSource(item: SourceForm, currentId?: string) {
    const name = item.name.trim().toLowerCase();
    if (!name) return "Source name is required.";
    if (sourceRows.some((row) => row.id !== currentId && row.name.trim().toLowerCase() === name)) return "Source name already exists.";
    return null;
  }

  function validateWiring(item: WiringForm, currentId?: string) {
    if (!item.utilityTypeId) return "Utility type is required.";
    if (!item.sourceId) return "Source is required.";
    if (wiringRows.some((row) => row.id !== currentId && row.utilityTypeId === item.utilityTypeId && row.sourceId === item.sourceId)) return "This source wiring already exists.";
    return null;
  }

  const sourceColumns: Array<DataColumn<SettingsEntity>> = [
    { id: "name", header: "Source", cell: (row) => <div className="min-w-0"><div className="truncate text-sm font-medium">{row.name}</div><div className="mt-0.5 text-xs text-muted-foreground">ID {row.id}</div></div> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge tone={row.status === 1 ? "compliant" : "neutral"}>{row.status === 1 ? "active" : "inactive"}</StatusBadge> },
    { id: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setSourceEdit({ ...row })} onDelete={() => setDeleteSourceId(row.id)} /> },
  ];

  const wiringColumns: Array<DataColumn<SourceWiringEntity>> = [
    { id: "utilityType", header: "Utility Type", cell: (row) => <div className="min-w-0"><div className="truncate text-sm font-medium">{row.utilityTypeName}</div><div className="mt-0.5 text-xs text-muted-foreground">{row.utilityTypeKey}</div></div> },
    { id: "source", header: "Source", cell: (row) => <div className="text-sm font-medium">{row.sourceName}</div> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge tone={row.status === 1 ? "compliant" : "neutral"}>{row.status === 1 ? "active" : "inactive"}</StatusBadge> },
    { id: "actions", header: "", className: "text-right", cell: (row) => <RowActions onEdit={() => setWiringEdit({ id: row.id, sourceId: row.sourceId, utilityTypeId: row.utilityTypeId, status: row.status })} onDelete={() => setDeleteWiringId(row.id)} /> },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        left={<div className="w-full sm:w-[360px]"><SearchInput value={search} onChange={setSearch} placeholder="Search source..." /></div>}
        right={<Button variant="outline" size="icon" onClick={() => void loadAll()} disabled={loading}><RefreshCw className="size-4" /></Button>}
        onClear={() => setSearch("")}
      />

      <SectionCard
        title="Source"
        description="Create and maintain source master records."
        action={
          <CreateActionDialog title="Create Source" triggerLabel="Create Source" submitLabel="Create" open={createSourceOpen} onOpenChange={setCreateSourceOpen} contentClassName="sm:max-w-xl" onCreate={async () => {
            const error = validateSource(sourceDraft);
            if (error) return toast.error(error), false;
            try {
              const created = await createSettingsEntity("sources", sourceDraft, userId);
              setSourceRows((current) => [created, ...current]);
              toast.success("Source created");
              return true;
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Create failed.");
              return false;
            }
          }}>
            <SourceFormFields value={sourceDraft} onChange={setSourceDraft} />
          </CreateActionDialog>
        }
      >
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}
        {!loading && filteredSourceRows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No source found.</div> : null}
        <DataTable rows={filteredSourceRows} columns={sourceColumns} rowKey={(row) => row.id} />
      </SectionCard>

      <SectionCard
        title="Source Wiring"
        description="Link each utility type primary key with one or more source primary keys."
        action={
          <CreateActionDialog title="Create Source Wiring" triggerLabel="Create Wiring" submitLabel="Create" open={createWiringOpen} onOpenChange={setCreateWiringOpen} contentClassName="sm:max-w-xl" onCreate={async () => {
            const error = validateWiring(wiringDraft);
            if (error) return toast.error(error), false;
            try {
              const created = await createSourceWiring(wiringDraft, userId);
              setWiringRows((current) => [created, ...current]);
              toast.success("Source wiring created");
              return true;
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Create failed.");
              return false;
            }
          }}>
            <WiringFormFields value={wiringDraft} onChange={setWiringDraft} sourceOptions={sourceRows.filter((row) => row.status === 1)} utilityTypeOptions={utilityTypeOptions} />
          </CreateActionDialog>
        }
      >
        <div className="mb-4 space-y-3">
          <FilterBar
            left={<div className="w-full sm:w-[280px]"><SearchInput value={wiringSearch} onChange={setWiringSearch} placeholder="Search wiring..." /></div>}
            right={
              <>
                <SelectFilter value={wiringUtilityTypeFilter} onChange={setWiringUtilityTypeFilter} placeholder="Utility type" className="w-full sm:w-[200px]" items={[{ value: "all", label: "All utility types" }, ...utilityTypeOptions.map((item) => ({ value: item.id, label: item.name }))]} />
                <SelectFilter value={wiringStatusFilter} onChange={setWiringStatusFilter} placeholder="Status" className="w-full sm:w-[160px]" items={[{ value: "all", label: "All status" }, { value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} />
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

      <CreateActionDialog title="Edit Source" submitLabel="Save" hideTrigger open={Boolean(sourceEdit)} onOpenChange={(open) => { if (!open) setSourceEdit(null); }} contentClassName="sm:max-w-xl" onCreate={async () => {
        if (!sourceEdit) return false;
        const error = validateSource(sourceEdit, sourceEdit.id);
        if (error) return toast.error(error), false;
        try {
          const updated = await updateSettingsEntity("sources", sourceEdit, userId);
          setSourceRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
          toast.success("Source updated");
          return true;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Save failed.");
          return false;
        }
      }}>
        {sourceEdit ? <SourceFormFields value={sourceEdit} onChange={setSourceEdit} /> : null}
      </CreateActionDialog>

      <CreateActionDialog title="Edit Source Wiring" submitLabel="Save" hideTrigger open={Boolean(wiringEdit)} onOpenChange={(open) => { if (!open) setWiringEdit(null); }} contentClassName="sm:max-w-xl" onCreate={async () => {
        if (!wiringEdit) return false;
        const error = validateWiring(wiringEdit, wiringEdit.id);
        if (error) return toast.error(error), false;
        try {
          const updated = await updateSourceWiring(wiringEdit, userId);
          setWiringRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
          toast.success("Source wiring updated");
          return true;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Save failed.");
          return false;
        }
      }}>
        {wiringEdit ? <WiringFormFields value={wiringEdit} onChange={setWiringEdit} sourceOptions={sourceRows.filter((row) => row.status === 1)} utilityTypeOptions={utilityTypeOptions} /> : null}
      </CreateActionDialog>

      <ActionModal open={Boolean(deleteSourceId)} onOpenChange={(open) => { if (!open) setDeleteSourceId(null); }} title="Delete source?" description="This will remove the source record from the database." confirmLabel="Delete" tone="destructive" onConfirm={async () => {
        if (!deleteSourceId) return;
        await deleteSettingsEntity("sources", deleteSourceId, userId);
        setSourceRows((current) => current.filter((row) => row.id !== deleteSourceId));
        setWiringRows((current) => current.filter((row) => row.sourceId !== deleteSourceId));
        toast.success("Source deleted");
      }} />

      <ActionModal open={Boolean(deleteWiringId)} onOpenChange={(open) => { if (!open) setDeleteWiringId(null); }} title="Delete source wiring?" description="This will remove the relation between the utility type and source." confirmLabel="Delete" tone="destructive" onConfirm={async () => {
        if (!deleteWiringId) return;
        await deleteSourceWiring(deleteWiringId, userId);
        setWiringRows((current) => current.filter((row) => row.id !== deleteWiringId));
        toast.success("Source wiring deleted");
      }} />
    </div>
  );
}
