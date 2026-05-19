import * as React from "react";
import { RefreshCw } from "lucide-react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Switch } from "@/components/ui/primitives/switch";
import { ActionModal } from "@/components/feedback/ActionModal";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { DataTable } from "@/components/table/DataTable";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { SelectFilter } from "@/components/forms/SelectFilter";
import {
  listCompanies,
  type CompanyEntity,
} from "@/features/admin/settings/modules/services/companiesApi";
import {
  listSourceWiringLookups,
  listUomWiringLookups,
  type UtilityTypeOption,
} from "@/features/admin/settings/modules/services/uomSettingsApi";
import {
  createMeter,
  deleteMeter,
  listMeters,
  updateMeter,
  type MeterEntity,
} from "@/features/admin/settings/modules/services/metersApi";

type Draft = {
  id?: string;
  name: string;
  code: string;
  location: string;
  companyId: string;
  utilityTypeId: string;
  uomId: string;
  sourceId: string;
  isActive: boolean;
};

const emptyDraft: Draft = {
  name: "",
  code: "",
  location: "",
  companyId: "",
  utilityTypeId: "",
  uomId: "",
  sourceId: "",
  isActive: true,
};

export function MetersSettingsModule() {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [rows, setRows] = React.useState<MeterEntity[]>([]);
  const [companies, setCompanies] = React.useState<CompanyEntity[]>([]);
  const [utilityTypes, setUtilityTypes] = React.useState<UtilityTypeOption[]>([]);
  const [uoms, setUoms] = React.useState<Array<{ id: string; name: string }>>([]);
  const [sources, setSources] = React.useState<Array<{ id: string; name: string }>>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [selected, setSelected] = React.useState<MeterEntity | null>(null);
  const [edit, setEdit] = React.useState<Draft | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const [meters, companiesData, uomLookups, sourceLookups] = await Promise.all([
        listMeters(userId),
        listCompanies(userId),
        listUomWiringLookups(userId),
        listSourceWiringLookups(userId),
      ]);
      setRows(meters);
      setCompanies(companiesData);
      setUtilityTypes(uomLookups.utilityTypeOptions);
      setUoms(uomLookups.uomOptions);
      setSources(sourceLookups.sourceOptions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load meters.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filteredRows = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${row.companyName} ${row.utilityType} ${row.name} ${row.code || ""} ${row.location || ""}`
      .toLowerCase()
      .includes(q);
  });

  const columns = React.useMemo(
    () => [
      { id: "company", header: "Company", cell: (row: MeterEntity) => row.companyName },
      { id: "type", header: "Type", cell: (row: MeterEntity) => row.utilityTypeName || row.utilityType },
      { id: "name", header: "Meter", cell: (row: MeterEntity) => row.name },
      { id: "code", header: "Code", cell: (row: MeterEntity) => row.code || "-" },
      { id: "uom", header: "UOM", cell: (row: MeterEntity) => row.uom },
      { id: "source", header: "Source", cell: (row: MeterEntity) => row.sourceName || "-" },
      { id: "status", header: "Status", cell: (row: MeterEntity) => (row.isActive ? "Active" : "Inactive") },
    ],
    [],
  );

  function openEdit(row: MeterEntity) {
    setSelected(row);
    setEdit({
      id: row.id,
      name: row.name,
      code: row.code || "",
      location: row.location || "",
      companyId: row.companyId,
      utilityTypeId: row.utilityTypeId,
      uomId: row.uomId,
      sourceId: row.sourceId || "",
      isActive: row.isActive,
    });
    setConfirmDelete(false);
  }

  async function saveCreate() {
    if (!draft.companyId) return toast.error("Company is required."), false;
    if (!draft.utilityTypeId) return toast.error("Utility type is required."), false;
    if (!draft.uomId) return toast.error("UOM is required."), false;
    if (!draft.name.trim()) return toast.error("Meter name is required."), false;
    try {
      const created = await createMeter(userId, {
        companyId: draft.companyId,
        utilityTypeId: draft.utilityTypeId,
        uomId: draft.uomId,
        sourceId: draft.sourceId || undefined,
        name: draft.name.trim(),
        code: draft.code.trim() || undefined,
        location: draft.location.trim() || undefined,
        isActive: draft.isActive,
      });
      setRows((current) => [created, ...current]);
      setDraft(emptyDraft);
      toast.success("Meter created");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Create failed");
      return false;
    }
  }

  async function saveEdit() {
    if (!edit?.id) return false;
    if (!edit.companyId) return toast.error("Company is required."), false;
    if (!edit.utilityTypeId) return toast.error("Utility type is required."), false;
    if (!edit.uomId) return toast.error("UOM is required."), false;
    if (!edit.name.trim()) return toast.error("Meter name is required."), false;
    try {
      const updated = await updateMeter(userId, {
        id: edit.id,
        companyId: edit.companyId,
        utilityTypeId: edit.utilityTypeId,
        uomId: edit.uomId,
        sourceId: edit.sourceId || undefined,
        name: edit.name.trim(),
        code: edit.code.trim() || undefined,
        location: edit.location.trim() || undefined,
        isActive: edit.isActive,
      });
      setRows((current) => current.map((r) => (r.id === updated.id ? updated : r)));
      setSelected(updated);
      setEdit(null);
      toast.success("Saved");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
      return false;
    }
  }

  async function confirmDeleteSelected() {
    if (!selected) return;
    try {
      await deleteMeter(userId, selected.id);
      setRows((current) => current.filter((r) => r.id !== selected.id));
      setSelected(null);
      setEdit(null);
      setConfirmDelete(false);
      toast.success("Deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadAll()} disabled={loading}>
          <RefreshCw className="size-4" />
        </Button>
        <CreateActionDialog
          title="Create meter"
          triggerLabel="Create meter"
          triggerVariant="floating"
          submitLabel="Create"
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setDraft(emptyDraft);
          }}
          contentClassName="sm:max-w-xl"
          onCreate={saveCreate}
        >
          <MeterForm
            value={draft}
            onChange={setDraft}
            companies={companies}
            utilityTypes={utilityTypes}
            uoms={uoms}
            sources={sources}
          />
        </CreateActionDialog>
      </div>

      <FilterBar
        left={
          <div className="w-full sm:w-[360px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search meters..." />
          </div>
        }
        onClear={() => setSearch("")}
      />

      <SectionCard
        title="Meters"
        description="Maintain meters per company and utility type. These meters are used in Utilities create form."
      >
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}
        {!loading && filteredRows.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No meters found.</div>
        ) : null}
        <DataTable rows={filteredRows} columns={columns} rowKey={(row) => row.id} onRowClick={openEdit} />
      </SectionCard>

      <CreateActionDialog
        title="Edit meter"
        submitLabel="Save"
        hideTrigger
        open={Boolean(edit)}
        onOpenChange={(open) => {
          if (open) return;
          setEdit(null);
          setConfirmDelete(false);
        }}
        contentClassName="sm:max-w-xl"
        onCreate={saveEdit}
      >
        {edit ? (
          <MeterForm
            value={edit}
            onChange={setEdit}
            companies={companies}
            utilityTypes={utilityTypes}
            uoms={uoms}
            sources={sources}
          />
        ) : null}
        <div className="px-4 pb-4 sm:px-6">
          <Button
            variant="destructive"
            className="w-full"
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={!selected}
          >
            Delete
          </Button>
        </div>
      </CreateActionDialog>

      <ActionModal
        open={confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(false)}
        title="Delete this meter?"
        description="This removes the meter from settings. Existing utility records will keep their meter name, but future selection will not include this meter."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDeleteSelected}
      />
    </div>
  );
}

function MeterForm(props: {
  value: Draft;
  onChange: (next: Draft) => void;
  companies: CompanyEntity[];
  utilityTypes: UtilityTypeOption[];
  uoms: Array<{ id: string; name: string }>;
  sources: Array<{ id: string; name: string }>;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Company</Label>
          <SelectFilter
            value={props.value.companyId}
            onChange={(value) => props.onChange({ ...props.value, companyId: value })}
            placeholder="Select company"
            items={props.companies.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Utility type</Label>
          <SelectFilter
            value={props.value.utilityTypeId}
            onChange={(value) => props.onChange({ ...props.value, utilityTypeId: value })}
            placeholder="Select type"
            items={props.utilityTypes.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>UOM</Label>
          <SelectFilter
            value={props.value.uomId}
            onChange={(value) => props.onChange({ ...props.value, uomId: value })}
            placeholder="Select UOM"
            items={props.uoms.map((u) => ({ value: u.id, label: u.name }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Source (optional)</Label>
          <SelectFilter
            value={props.value.sourceId}
            onChange={(value) => props.onChange({ ...props.value, sourceId: value })}
            placeholder="Select source"
            items={[{ value: "", label: "None" }, ...props.sources.map((s) => ({ value: s.id, label: s.name }))]}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label>Meter name</Label>
          <Input
            value={props.value.name}
            onChange={(e) => props.onChange({ ...props.value, name: e.target.value })}
            placeholder="e.g. Main incomer"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Code (optional)</Label>
          <Input
            value={props.value.code}
            onChange={(e) => props.onChange({ ...props.value, code: e.target.value })}
            placeholder="e.g. EB-MAIN"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Location (optional)</Label>
          <Input
            value={props.value.location}
            onChange={(e) => props.onChange({ ...props.value, location: e.target.value })}
            placeholder="e.g. Substation"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">Active</div>
          <div className="text-xs text-muted-foreground">
            Inactive meters won't appear in Utilities selection.
          </div>
        </div>
        <Switch checked={props.value.isActive} onCheckedChange={(checked) => props.onChange({ ...props.value, isActive: checked })} />
      </div>
    </div>
  );
}
