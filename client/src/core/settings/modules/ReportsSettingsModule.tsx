import * as React from "react";
import { RefreshCw } from "lucide-react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/user";
import { Button } from "@/core/app/components/ui/button";
import { Input } from "@/core/app/components/ui/input";
import { Label } from "@/core/app/components/ui/label";
import { Switch } from "@/core/app/components/ui/switch";
import { Textarea } from "@/core/app/components/ui/textarea";
import { ActionModal } from "@/core/components/ActionModal";
import { CreateActionDialog } from "@/core/components/CreateActionDialog";
import { DataTable } from "@/core/components/DataTable";
import { FilterBar } from "@/core/components/FilterBar";
import { SearchInput } from "@/core/components/SearchInput";
import { SectionCard } from "@/core/components/SectionCard";
import {
  createReportDefinition,
  deleteReportDefinition,
  listReportDefinitions,
  type ReportDefinitionEntity,
  type ReportVariableDef,
  updateReportDefinition,
} from "@/core/settings/modules/reportsApi";

type Draft = {
  id?: string;
  key: string;
  name: string;
  description: string;
  requiresCompany: boolean;
  sqlText: string;
  variablesText: string;
  isActive: boolean;
};

const defaultVariables: ReportVariableDef[] = [
  { name: "companyId", label: "Company", type: "company", required: true },
];

const emptyDraft: Draft = {
  key: "",
  name: "",
  description: "",
  requiresCompany: true,
  sqlText: "SELECT 1 AS ok WHERE 1 = 1",
  variablesText: JSON.stringify(defaultVariables, null, 2),
  isActive: true,
};

export function ReportsSettingsModule() {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [rows, setRows] = React.useState<ReportDefinitionEntity[]>([]);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [selected, setSelected] = React.useState<ReportDefinitionEntity | null>(null);
  const [edit, setEdit] = React.useState<Draft | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const defs = await listReportDefinitions(userId);
      setRows(defs);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load reports.");
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
    return `${row.name} ${row.key} ${row.description}`.toLowerCase().includes(q);
  });

  const columns = React.useMemo(() => {
    return [
      { id: "name", header: "Report", cell: (row: ReportDefinitionEntity) => row.name },
      { id: "key", header: "Key", cell: (row: ReportDefinitionEntity) => row.key },
      { id: "requiresCompany", header: "Company", cell: (row: ReportDefinitionEntity) => (row.requiresCompany ? "Required" : "Optional") },
      { id: "status", header: "Status", cell: (row: ReportDefinitionEntity) => (row.isActive ? "Active" : "Inactive") },
    ];
  }, []);

  function openEdit(row: ReportDefinitionEntity) {
    setSelected(row);
    setEdit({
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description || "",
      requiresCompany: row.requiresCompany,
      sqlText: row.sqlText,
      variablesText: JSON.stringify(row.variables ?? [], null, 2),
      isActive: row.isActive,
    });
    setConfirmDelete(false);
  }

  function parseVariables(text: string): ReportVariableDef[] | null {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) return null;
      return parsed as ReportVariableDef[];
    } catch {
      return null;
    }
  }

  async function saveCreate() {
    const vars = parseVariables(draft.variablesText);
    if (!draft.key.trim()) return toast.error("Key is required."), false;
    if (!draft.name.trim()) return toast.error("Name is required."), false;
    if (!draft.sqlText.trim()) return toast.error("SQL is required."), false;
    if (!vars) return toast.error("Variables must be valid JSON array."), false;

    try {
      await createReportDefinition(userId, {
        key: draft.key.trim(),
        name: draft.name.trim(),
        description: draft.description.trim(),
        requiresCompany: draft.requiresCompany,
        sqlText: draft.sqlText,
        variables: vars,
        isActive: draft.isActive,
      });
      setCreateOpen(false);
      setDraft(emptyDraft);
      void loadAll();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create report.");
      return false;
    }
  }

  async function saveEdit() {
    if (!edit?.id || !selected) return false;
    const vars = parseVariables(edit.variablesText);
    if (!edit.key.trim()) return toast.error("Key is required."), false;
    if (!edit.name.trim()) return toast.error("Name is required."), false;
    if (!edit.sqlText.trim()) return toast.error("SQL is required."), false;
    if (!vars) return toast.error("Variables must be valid JSON array."), false;

    try {
      await updateReportDefinition(userId, {
        id: edit.id,
        key: edit.key.trim(),
        name: edit.name.trim(),
        description: edit.description.trim(),
        requiresCompany: edit.requiresCompany,
        sqlText: edit.sqlText,
        variables: vars,
        isActive: edit.isActive,
      });
      setEdit(null);
      setSelected(null);
      void loadAll();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update report.");
      return false;
    }
  }

  async function confirmDeleteSelected() {
    if (!selected) return;
    try {
      await deleteReportDefinition(userId, selected.id);
      setConfirmDelete(false);
      setEdit(null);
      setSelected(null);
      void loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete report.");
    }
  }

  return (
    <div className="space-y-4">
      <FilterBar
        left={<SearchInput value={search} onChange={setSearch} placeholder="Search reports..." />}
        right={(
          <>
            <Button variant="outline" size="sm" onClick={() => void loadAll()} disabled={loading}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>New report</Button>
          </>
        )}
      />

      <SectionCard
        title="Report control"
        description="Manage report name, description, SQL query, and variables. Reports must be SELECT-only."
      >
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading from database...</div> : null}
        {!loading && filteredRows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No reports found.</div> : null}
        <DataTable rows={filteredRows} columns={columns} rowKey={(row) => row.id} onRowClick={openEdit} />
      </SectionCard>

      <CreateActionDialog
        title="Create report"
        submitLabel="Create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={saveCreate}
        contentClassName="sm:max-w-3xl"
      >
        <ReportForm value={draft} onChange={setDraft} />
      </CreateActionDialog>

      <CreateActionDialog
        title="Edit report"
        submitLabel="Save"
        hideTrigger
        open={Boolean(edit)}
        onOpenChange={(open) => {
          if (open) return;
          setEdit(null);
          setSelected(null);
          setConfirmDelete(false);
        }}
        onCreate={saveEdit}
        contentClassName="sm:max-w-3xl"
      >
        {edit ? <ReportForm value={edit} onChange={setEdit} /> : null}
        <div className="px-4 pb-4 sm:px-6">
          <Button variant="destructive" className="w-full" type="button" onClick={() => setConfirmDelete(true)} disabled={!selected}>
            Delete
          </Button>
        </div>
      </CreateActionDialog>

      <ActionModal
        open={confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(false)}
        title="Delete this report?"
        description="This removes the report definition from the database."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDeleteSelected}
      />
    </div>
  );
}

function ReportForm(props: { value: Draft; onChange: (next: Draft) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Key</Label>
          <Input value={props.value.key} onChange={(e) => props.onChange({ ...props.value, key: e.target.value })} placeholder="e.g. utilities_master_data" />
        </div>
        <div className="grid gap-1.5">
          <Label>Name</Label>
          <Input value={props.value.name} onChange={(e) => props.onChange({ ...props.value, name: e.target.value })} placeholder="e.g. Utilities master data" />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label>Description</Label>
          <Input value={props.value.description} onChange={(e) => props.onChange({ ...props.value, description: e.target.value })} placeholder="Shown on Reports page" />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">Requires company</div>
            <div className="text-xs text-muted-foreground">If enabled, report run must include companyId.</div>
          </div>
          <Switch checked={props.value.requiresCompany} onCheckedChange={(checked) => props.onChange({ ...props.value, requiresCompany: checked })} />
        </div>
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">Active</div>
            <div className="text-xs text-muted-foreground">Inactive reports will not appear in Reports.</div>
          </div>
          <Switch checked={props.value.isActive} onCheckedChange={(checked) => props.onChange({ ...props.value, isActive: checked })} />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Variables (JSON)</Label>
        <Textarea
          value={props.value.variablesText}
          onChange={(e) => props.onChange({ ...props.value, variablesText: e.target.value })}
          className="min-h-28 font-mono text-xs"
          placeholder='[{"name":"companyId","label":"Company","type":"company","required":true}]'
        />
      </div>

      <div className="grid gap-1.5">
        <Label>SQL query</Label>
        <Textarea
          value={props.value.sqlText}
          onChange={(e) => props.onChange({ ...props.value, sqlText: e.target.value })}
          className="min-h-56 font-mono text-xs"
          placeholder="SELECT ..."
        />
        <div className="text-muted-foreground text-xs">
          Use variables like <span className="font-mono">{`{{companyDbId}}`}</span>, <span className="font-mono">{`{{fromDate}}`}</span>, <span className="font-mono">{`{{toDate}}`}</span>.
        </div>
      </div>
    </div>
  );
}

