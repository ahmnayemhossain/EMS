import * as React from "react";

import { SearchInput } from "@/components/forms/SearchInput";
import { PageHeader } from "@/components/layout/primitives/PageHeader";
import { Button } from "@/components/ui/primitives/button";
import { DndProvider } from "@/core/app/providers/DndProvider";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useCan } from "@/core/app/state/slices/permissions";
import { useUser } from "@/core/app/state/slices/user";
import { Archive, KanbanSquare, List, RefreshCw } from "lucide-react";

import { CapaBoard } from "../components/CapaBoard";
import { CreateCapaDialog, EditCapaDialog } from "../components/CapaDialogs";
import { CapaListView } from "../components/CapaListView";
import { useCapaBoard } from "../hooks/useCapaBoard";

export function CapaPage() {
  const { userId } = useUser();
  const { companies, selectedCompanyId } = useSelectedCompany();
  const selectedCompany = React.useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );
  const canWrite = useCan("capa:write");
  const canUpdate = useCan("capa:update");
  const canDelete = useCan("capa:delete");
  const { rows, filteredRows, loading, search, setSearch, loadRows, createRecord, updateRecord, moveRecord, deleteRecord, dismissRecord } = useCapaBoard(
    userId,
    selectedCompanyId || undefined,
  );
  const [view, setView] = React.useState<"kanban" | "list">("kanban");
  const [mode, setMode] = React.useState<"active" | "dismissed">("active");
  const [selected, setSelected] = React.useState<(typeof rows)[number] | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const activeRows = React.useMemo(() => filteredRows.filter((item) => !item.dismissed), [filteredRows]);
  const dismissedRows = React.useMemo(() => filteredRows.filter((item) => item.dismissed), [filteredRows]);

  return (
    <DndProvider>
      <div className="space-y-4 pb-6">
        <PageHeader
          actions={
            <div className="flex items-center gap-2">
              <div className="hidden w-[280px] lg:block">
                <SearchInput value={search} onChange={setSearch} placeholder="Search CAPA..." />
              </div>
              <Button
                variant={mode === "dismissed" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode((current) => (current === "active" ? "dismissed" : "active"))}
                className="gap-2"
              >
                <Archive className="size-4" />
                Dismissed
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setView((current) => (current === "kanban" ? "list" : "kanban"))}
                aria-label={view === "kanban" ? "Switch to list view" : "Switch to kanban view"}
                title={view === "kanban" ? "List view" : "Kanban view"}
              >
                {view === "kanban" ? <List className="size-4" /> : <KanbanSquare className="size-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={() => void loadRows()} disabled={loading} aria-label="Refresh CAPA">
                <RefreshCw className={["size-4", loading ? "animate-spin" : ""].join(" ")} />
              </Button>
            </div>
          }
        />
        <div className="lg:hidden">
          <SearchInput value={search} onChange={setSearch} placeholder="Search CAPA..." />
        </div>

        {!selectedCompanyId ? (
          <div className="grid min-h-[260px] place-items-center rounded-[28px] border border-dashed bg-card/65 p-8 text-center text-sm text-muted-foreground">
            Select a company first.
          </div>
        ) : loading ? (
          <div className="grid min-h-[260px] place-items-center rounded-[28px] border bg-card/65 p-8 text-sm text-muted-foreground">
            Loading CAPA from database...
          </div>
        ) : mode === "dismissed" ? (
          <CapaListView
            rows={dismissedRows}
            mode="dismissed"
            onRestore={async (item) => {
              await dismissRecord(item.id, false);
            }}
            onOpen={(item) => {
              setSelected(item);
              setEditOpen(true);
            }}
          />
        ) : view === "list" ? (
          <CapaListView
            rows={activeRows}
            onOpen={(item) => {
              setSelected(item);
              setEditOpen(true);
            }}
          />
        ) : (
          <CapaBoard
            rows={activeRows}
            canMove={canUpdate}
            onMove={moveRecord}
            onDismiss={async (item) => {
              await dismissRecord(item.id, true);
            }}
            onOpen={(item) => {
              setSelected(item);
              setEditOpen(true);
            }}
          />
        )}

        <EditCapaDialog
          companyName={selectedCompany?.name ?? "Company"}
          item={selected}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={updateRecord}
          canDelete={canDelete}
          onDelete={deleteRecord}
        />
        {canWrite ? (
          <CreateCapaDialog
            floating
            companyId={selectedCompanyId || undefined}
            companyName={selectedCompany?.name ?? "No company selected"}
            onCreate={createRecord}
          />
        ) : null}
      </div>
    </DndProvider>
  );
}
