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
  createCompany,
  deleteCompany,
  listCompanies,
  type CompanyEntity,
  updateCompany,
} from "./companiesApi";

type ValidationErrors = Partial<Record<"name" | "shortName" | "status", string>>;

function blankCompany(): CompanyEntity {
  return {
    id: "",
    name: "",
    shortName: "",
    localName: "",
    address: "",
    status: 1,
  };
}

function validateCompany(company: CompanyEntity, rows: CompanyEntity[], currentId?: string) {
  const errors: ValidationErrors = {};
  if (!company.name.trim()) {
    errors.name = "Company name is required";
  } else if (rows.some((row) => row.id !== currentId && row.name.toLowerCase() === company.name.toLowerCase())) {
    errors.name = "Company name already exists";
  }
  if (!company.shortName.trim()) {
    errors.shortName = "Short name is required";
  } else if (
    rows.some((row) => row.id !== currentId && row.shortName.toLowerCase() === company.shortName.toLowerCase())
  ) {
    errors.shortName = "Short name already exists";
  }
  if (![0, 1].includes(Number(company.status))) errors.status = "Status is required";
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
  onCancel,
  onConfirm,
}: {
  label: string;
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
        <div className="mt-3 text-base font-semibold">Delete {label || "company"}?</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          This will remove the company from the database and write a delete log.
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

function CompanyForm({
  value,
  onChange,
  errors = {},
}: {
  value: CompanyEntity;
  onChange: (company: CompanyEntity) => void;
  errors?: ValidationErrors;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Name" required error={errors.name}>
        <Input
          value={value.name}
          aria-invalid={Boolean(errors.name) || undefined}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder="Company name"
        />
      </Field>
      <Field label="Short name" required error={errors.shortName}>
        <Input
          value={value.shortName}
          aria-invalid={Boolean(errors.shortName) || undefined}
          onChange={(event) => onChange({ ...value, shortName: event.target.value })}
          placeholder="Short name"
        />
      </Field>
      <Field label="Local name">
        <Input
          value={value.localName ?? ""}
          onChange={(event) => onChange({ ...value, localName: event.target.value })}
          placeholder="Local name"
        />
      </Field>
      <Field label="Address">
        <Input
          value={value.address ?? ""}
          onChange={(event) => onChange({ ...value, address: event.target.value })}
          placeholder="Address"
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

export function CompaniesModule() {
  const { userId } = useUser();
  const [companies, setCompanies] = React.useState<CompanyEntity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<CompanyEntity | null>(null);
  const [editDraft, setEditDraft] = React.useState<CompanyEntity | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<CompanyEntity>(() => blankCompany());
  const [createErrors, setCreateErrors] = React.useState<ValidationErrors>({});
  const [editErrors, setEditErrors] = React.useState<ValidationErrors>({});

  const loadCompanies = React.useCallback(async () => {
    try {
      setLoading(true);
      setCompanies(await listCompanies(userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load companies");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  React.useEffect(() => {
    if (createOpen) {
      setDraft(blankCompany());
      setCreateErrors({});
    }
  }, [createOpen]);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies
      .filter((company) => {
        if (!q) return true;
        const hay = `${company.name} ${company.shortName} ${company.localName || ""} ${company.address || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companies, search]);

  const columns: Array<DataColumn<CompanyEntity>> = [
    {
      id: "name",
      header: "Company",
      cell: (company) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{company.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {company.localName || "No local name"}
          </div>
        </div>
      ),
    },
    {
      id: "shortName",
      header: "Short name",
      cell: (company) => <div className="text-sm font-medium">{company.shortName}</div>,
    },
    {
      id: "address",
      header: "Address",
      cell: (company) => <div className="max-w-[320px] truncate text-sm">{company.address || "-"}</div>,
    },
    {
      id: "status",
      header: "Status",
      cell: (company) => (
        <StatusBadge tone={company.status === 1 ? "compliant" : "neutral"}>
          {company.status === 1 ? "active" : "inactive"}
        </StatusBadge>
      ),
      className: "text-right",
    },
  ];

  async function saveEdit() {
    if (!selected || !editDraft) return;
    const errors = validateCompany(editDraft, companies, selected.id);
    setEditErrors(errors);
    const message = firstError(errors);
    if (message) return toast.error(message);

    try {
      const updated = await updateCompany(editDraft, userId);
      setCompanies((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      setSelected(updated);
      setEditDraft(null);
      setEditErrors({});
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Company save failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadCompanies()} disabled={loading}>
          <RefreshCw className="size-4" />
        </Button>
        <CreateActionDialog
          title="Create company"
          triggerLabel="Create"
          submitLabel="Create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          contentClassName="sm:max-w-2xl"
          onCreate={async () => {
            const errors = validateCompany(draft, companies);
            setCreateErrors(errors);
            const message = firstError(errors);
            if (message) return toast.error(message), false;

            try {
              const created = await createCompany(draft, userId);
              setCompanies((rows) => [created, ...rows]);
              setCreateErrors({});
              toast.success("Company created");
              return true;
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Company create failed");
              return false;
            }
          }}
        >
          <CompanyForm
            value={draft}
            onChange={(company) => {
              setDraft(company);
              if (Object.keys(createErrors).length) setCreateErrors({});
            }}
            errors={createErrors}
          />
        </CreateActionDialog>
      </div>

      <FilterBar
        left={
          <div className="w-full sm:w-[360px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search companies..." />
          </div>
        }
        onClear={() => {
          setSearch("");
        }}
      />

      <SectionCard title="Companies" description="Company master data used by employees, users, dashboards, and operations.">
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading companies from database...</div> : null}
        {!loading && rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No companies found.</div> : null}
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          onRowClick={(company) => {
            setSelected(company);
            setEditDraft(null);
            setEditErrors({});
            setConfirmDelete(false);
          }}
        />
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
        title={editDraft ? "Edit company" : "Company"}
        description={selected ? selected.name : undefined}
        overlay={
          selected && confirmDelete ? (
            <DrawerDeleteConfirm
              label={selected.name}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={async () => {
                await deleteCompany(selected.id, userId);
                setCompanies((rows) => rows.filter((company) => company.id !== selected.id));
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
              <CompanyForm
                value={editDraft}
                onChange={(company) => {
                  setEditDraft(company);
                  if (Object.keys(editErrors).length) setEditErrors({});
                }}
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
                <DetailRow label="Short name">{selected.shortName}</DetailRow>
                <DetailRow label="Local name">{selected.localName || "-"}</DetailRow>
                <DetailRow label="Address">{selected.address || "-"}</DetailRow>
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
