import * as React from "react";
import { Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { useUser } from "@/app/state/user";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { SectionCard } from "@/components/SectionCard";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { DetailPanel } from "@/components/DetailPanel";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { StatusBadge } from "@/components/StatusBadge";
import {
  createSettingsEntity,
  deleteSettingsEntity,
  listSettingsEntities,
  type SettingsEntity,
  type SettingsEntityKind,
  updateSettingsEntity,
} from "./settingsEntityApi";

type ValidationErrors = Partial<Record<"name" | "status", string>>;

function blankItem(): SettingsEntity {
  return { id: "", name: "", status: 1 };
}

function validateItem(item: SettingsEntity, rows: SettingsEntity[], label: string, currentId?: string) {
  const errors: ValidationErrors = {};
  if (!item.name.trim()) {
    errors.name = `${label} name is required`;
  } else if (rows.some((row) => row.id !== currentId && row.name.toLowerCase() === item.name.toLowerCase())) {
    errors.name = `${label} name already exists`;
  }
  if (![0, 1].includes(Number(item.status))) errors.status = "Status is required";
  return errors;
}

function firstError(errors: ValidationErrors) {
  return Object.values(errors)[0] ?? null;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">
        {label}
        {required ? <span className="ml-1 font-semibold text-destructive">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs font-medium text-destructive">{error}</span> : null}
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="max-w-[65%] text-right text-sm font-medium break-words">{children}</div>
    </div>
  );
}

function DrawerDeleteConfirm({
  label,
  noun,
  onCancel,
  onConfirm,
}: {
  label: string;
  noun: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="absolute inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border bg-background p-5 text-center shadow-2xl">
        <div className="mx-auto grid size-11 place-items-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
          <Trash2 className="size-5" />
        </div>
        <div className="mt-3 text-base font-semibold">Delete {label || noun}?</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          This will remove the {noun.toLowerCase()} from the database and write a delete log.
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              try {
                setBusy(true);
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EntityForm({
  value,
  onChange,
  label,
  errors = {},
}: {
  value: SettingsEntity;
  onChange: (item: SettingsEntity) => void;
  label: string;
  errors?: ValidationErrors;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={`${label} name`} required error={errors.name}>
        <Input
          value={value.name}
          aria-invalid={Boolean(errors.name) || undefined}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder={`${label} name`}
        />
      </Field>
      <Field label="Status" required error={errors.status}>
        <SelectFilter
          value={String(value.status)}
          onChange={(status) => onChange({ ...value, status: status === "0" ? 0 : 1 })}
          placeholder="Status"
          invalid={Boolean(errors.status)}
          className="w-full"
          items={[
            { value: "1", label: "Active" },
            { value: "0", label: "Inactive" },
          ]}
        />
      </Field>
    </div>
  );
}

export function ReferenceSettingsModule({
  kind,
  title,
  noun,
  description,
}: {
  kind: SettingsEntityKind;
  title: string;
  noun: string;
  description: string;
}) {
  const { userId } = useUser();
  const [rows, setRows] = React.useState<SettingsEntity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<SettingsEntity | null>(null);
  const [editDraft, setEditDraft] = React.useState<SettingsEntity | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<SettingsEntity>(() => blankItem());
  const [createErrors, setCreateErrors] = React.useState<ValidationErrors>({});
  const [editErrors, setEditErrors] = React.useState<ValidationErrors>({});

  const loadRows = React.useCallback(async () => {
    try {
      setLoading(true);
      setRows(await listSettingsEntities(kind, userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [kind, title, userId]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  React.useEffect(() => {
    if (createOpen) {
      setDraft(blankItem());
      setCreateErrors({});
    }
  }, [createOpen]);

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((row) => (!q ? true : row.name.toLowerCase().includes(q)))
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [rows, search]);

  const columns: Array<DataColumn<SettingsEntity>> = [
    {
      id: "name",
      header: noun,
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
      className: "text-right",
    },
  ];

  function openDetails(item: SettingsEntity) {
    setSelected(item);
    setEditDraft(null);
    setEditErrors({});
    setConfirmDelete(false);
  }

  async function saveEdit() {
    if (!selected || !editDraft) return;
    const errors = validateItem(editDraft, rows, noun, selected.id);
    setEditErrors(errors);
    const message = firstError(errors);
    if (message) return toast.error(message);

    try {
      const updated = await updateSettingsEntity(kind, editDraft, userId);
      setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setSelected(updated);
      setEditDraft(null);
      setEditErrors({});
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadRows()} disabled={loading}>
          <RefreshCw className="size-4" />
        </Button>
        <CreateActionDialog
          title={`Create ${noun.toLowerCase()}`}
          triggerLabel="Create"
          submitLabel="Create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          contentClassName="sm:max-w-xl"
          onCreate={async () => {
            const errors = validateItem(draft, rows, noun);
            setCreateErrors(errors);
            const message = firstError(errors);
            if (message) return toast.error(message), false;

            try {
              const created = await createSettingsEntity(kind, draft, userId);
              setRows((current) => [created, ...current]);
              setCreateErrors({});
              toast.success(`${noun} created`);
              return true;
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Create failed");
              return false;
            }
          }}
        >
          <EntityForm
            value={draft}
            onChange={(item) => {
              setDraft(item);
              if (Object.keys(createErrors).length) setCreateErrors({});
            }}
            label={noun}
            errors={createErrors}
          />
        </CreateActionDialog>
      </div>

      <FilterBar
        left={
          <div className="w-full sm:w-[360px]">
            <SearchInput value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />
          </div>
        }
        onClear={() => setSearch("")}
      />

      <SectionCard title={title} description={description}>
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}
        {!loading && filteredRows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No records found.</div> : null}
        <DataTable rows={filteredRows} columns={columns} rowKey={(row) => row.id} onRowClick={openDetails} />
      </SectionCard>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (open) return;
          setSelected(null);
          setEditDraft(null);
          setEditErrors({});
          setConfirmDelete(false);
        }}
        title={editDraft ? `Edit ${noun.toLowerCase()}` : noun}
        description={selected ? selected.name : undefined}
        overlay={
          selected && confirmDelete ? (
            <DrawerDeleteConfirm
              label={selected.name}
              noun={noun}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={async () => {
                await deleteSettingsEntity(kind, selected.id, userId);
                setRows((current) => current.filter((row) => row.id !== selected.id));
                setConfirmDelete(false);
                setEditDraft(null);
                setSelected(null);
                toast.success("Deleted");
              }}
            />
          ) : null
        }
      >
        {selected ? (
          editDraft ? (
            <div className="space-y-4">
              <EntityForm
                value={editDraft}
                onChange={(item) => {
                  setEditDraft(item);
                  if (Object.keys(editErrors).length) setEditErrors({});
                }}
                label={noun}
                errors={editErrors}
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDraft(null);
                    setEditErrors({});
                  }}
                >
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
                <Button onClick={() => void saveEdit()}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border px-3">
                <DetailRow label="Name">{selected.name}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge tone={selected.status === 1 ? "compliant" : "neutral"}>
                    {selected.status === 1 ? "active" : "inactive"}
                  </StatusBadge>
                </DetailRow>
                <DetailRow label="Created by">{selected.createdByUserName || "-"}</DetailRow>
                <DetailRow label="Updated by">{selected.updatedByUserName || "-"}</DetailRow>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    setEditDraft({ ...selected });
                    setEditErrors({});
                  }}
                >
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Button>
              </div>
            </div>
          )
        ) : null}
      </DetailPanel>
    </div>
  );
}
