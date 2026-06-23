import * as React from "react";
import { Download, FileText, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { DataTable, type DataColumn } from "@/components/table/DataTable";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Textarea } from "@/components/ui/primitives/textarea";
import { toast } from "@/core/app/lib/toast";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useUser } from "@/core/app/state/slices/user";
import type { Document } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

import { createDocumentRecord, deleteDocumentRecord, listDocuments } from "./services/api";

const DOCUMENT_CATEGORIES: Array<{ value: Document["category"]; label: string }> = [
  { value: "permit", label: "Permit" },
  { value: "policy", label: "Policy" },
  { value: "procedure", label: "Procedure" },
  { value: "report", label: "Report" },
  { value: "certificate", label: "Certificate" },
  { value: "contract", label: "Contract" },
];

export function DocumentsPage() {
  const { userId } = useUser();
  const { companies, selectedCompanyId } = useSelectedCompany();
  const [rows, setRows] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [companyFilter, setCompanyFilter] = React.useState<string | undefined>(selectedCompanyId || undefined);
  const [categoryFilter, setCategoryFilter] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<Document | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [facilityId, setFacilityId] = React.useState("");
  const [category, setCategory] = React.useState<Document["category"]>("permit");
  const [ownerDepartment, setOwnerDepartment] = React.useState("");
  const [expiresOn, setExpiresOn] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!companyFilter && selectedCompanyId) setCompanyFilter(selectedCompanyId);
  }, [selectedCompanyId, companyFilter]);

  const loadRows = React.useCallback(async () => {
    try {
      setLoading(true);
      const next = await listDocuments(userId, companyFilter);
      setRows(Array.isArray(next) ? next : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, [userId, companyFilter]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (categoryFilter && row.category !== categoryFilter) return false;
      if (!query) return true;
      return [
        row.title,
        row.category,
        row.ownerDepartment,
        row.companyName,
        row.fileName,
      ].some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [rows, search, categoryFilter]);

  const columns = React.useMemo<Array<DataColumn<Document>>>(() => [
    {
      id: "document",
      header: "Document",
      className: "min-w-[340px]",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{row.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {row.category} • {row.ownerDepartment}
          </div>
        </div>
      ),
    },
    {
      id: "company",
      header: "Company",
      cell: (row) => <div className="text-sm">{row.companyName || row.facilityId}</div>,
    },
    {
      id: "expiry",
      header: "Expiry",
      cell: (row) => <div className="text-sm">{row.expiresOn ? formatDate(row.expiresOn) : "No expiry"}</div>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge
          tone={
            row.status === "expired"
              ? "critical"
              : row.status === "expiring"
                ? "warning"
                : "compliant"
          }
        >
          {row.status}
        </StatusBadge>
      ),
      className: "text-right",
    },
  ], []);

  function resetCreateForm() {
    setTitle("");
    setFacilityId(selectedCompanyId || companies[0]?.id || "");
    setCategory("permit");
    setOwnerDepartment("");
    setExpiresOn("");
    setNotes("");
    setFile(null);
  }

  return (
    <div className="space-y-6">
      <FilterBar
        left={(
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search documents..." />
            </div>
            <SelectFilter
              value={companyFilter}
              onChange={(value) => setCompanyFilter(value ?? undefined)}
              placeholder="Company"
              items={companies.map((company) => ({ value: company.id, label: company.name }))}
            />
            <SelectFilter
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value ?? undefined)}
              placeholder="Category"
              items={DOCUMENT_CATEGORIES}
            />
          </div>
        )}
        onClear={() => {
          setSearch("");
          setCompanyFilter(selectedCompanyId || undefined);
          setCategoryFilter(undefined);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Documents</div>
          <div className="mt-1 text-2xl font-semibold">{filteredRows.length}</div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Expiring</div>
          <div className="mt-1 text-2xl font-semibold">{filteredRows.filter((item) => item.status === "expiring").length}</div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Expired</div>
          <div className="mt-1 text-2xl font-semibold">{filteredRows.filter((item) => item.status === "expired").length}</div>
        </div>
      </div>

      <CreateActionDialog
        title="Upload document"
        triggerLabel="Upload document"
        triggerVariant="floating"
        submitLabel="Create"
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (open) resetCreateForm();
        }}
        onCreate={async () => {
          if (!facilityId) return toast.error("Select a company."), false;
          if (!title.trim()) return toast.error("Document title is required."), false;
          if (!ownerDepartment.trim()) return toast.error("Owner department is required."), false;
          if (!file) return toast.error("Document file is required."), false;

          try {
            const created = await createDocumentRecord(userId, {
              facilityId,
              title: title.trim(),
              category,
              ownerDepartment: ownerDepartment.trim(),
              expiresOn: expiresOn || undefined,
              notes: notes.trim() || undefined,
              file,
            });
            setRows((prev) => [created, ...prev]);
            toast.success("Document uploaded.");
            return true;
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create document.");
            return false;
          }
        }}
      >
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Company</Label>
            <SelectFilter
              value={facilityId}
              onChange={(value) => setFacilityId(value ?? "")}
              placeholder="Select company"
              items={companies.map((company) => ({ value: company.id, label: company.name }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Document title" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <SelectFilter value={category} onChange={(value) => setCategory((value as Document["category"]) || "permit")} placeholder="Select category" items={DOCUMENT_CATEGORIES} />
            </div>
            <div className="grid gap-1.5">
              <Label>Owner department</Label>
              <Input value={ownerDepartment} onChange={(event) => setOwnerDepartment(event.target.value)} placeholder="e.g. EHS / Admin" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Expiry date</Label>
            <Input type="date" value={expiresOn} onChange={(event) => setExpiresOn(event.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>File</Label>
            <Input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes" />
          </div>
        </div>
      </CreateActionDialog>

      {loading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Loading documents...</div>
      ) : (
        <DataTable rows={filteredRows} columns={columns} rowKey={(row) => row.id} onRowClick={(row) => setSelected(row)} />
      )}

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.title || "Document"}
        description={selected ? `${selected.companyName || selected.facilityId} • ${selected.category}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                tone={
                  selected.status === "expired"
                    ? "critical"
                    : selected.status === "expiring"
                      ? "warning"
                      : "compliant"
                }
              >
                {selected.status}
              </StatusBadge>
              <StatusBadge tone="neutral">{selected.ownerDepartment}</StatusBadge>
              {selected.expiresOn ? <StatusBadge tone="neutral">Expires {formatDate(selected.expiresOn)}</StatusBadge> : null}
            </div>

            <div className="rounded-xl border p-3 text-sm">
              <div><span className="font-medium">File:</span> {selected.fileName}</div>
              {selected.uploadedBy ? <div className="mt-1 text-muted-foreground">Uploaded by {selected.uploadedBy}</div> : null}
              {selected.uploadedAt ? <div className="mt-1 text-muted-foreground">{formatDate(selected.uploadedAt)}</div> : null}
            </div>

            {selected.notes ? (
              <div className="rounded-xl border p-3 text-sm text-muted-foreground">{selected.notes}</div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {selected.fileUrl ? (
                <Button asChild>
                  <a href={selected.fileUrl} target="_blank" rel="noreferrer">
                    <Download className="mr-2 size-4" />
                    Open file
                  </a>
                </Button>
              ) : null}
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await deleteDocumentRecord(userId, selected.id);
                    setRows((prev) => prev.filter((item) => item.id !== selected.id));
                    setSelected(null);
                    toast.success("Document deleted.");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not delete document.");
                  }
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}

export default DocumentsPage;
