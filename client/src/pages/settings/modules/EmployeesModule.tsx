import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { facilities } from "@/data/mock";
import type { Employee } from "@/types/admin";
import { useAdmin } from "@/app/state/admin";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { SectionCard } from "@/components/SectionCard";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { DetailPanel } from "@/components/DetailPanel";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { ActionModal } from "@/components/ActionModal";
import { StatusBadge } from "@/components/StatusBadge";
import { getFacilityName } from "@/data/mock";

function createId(prefix: string) {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

export function EmployeesModule() {
  const { employees, upsertEmployee, removeEmployee } = useAdmin();
  const [search, setSearch] = React.useState("");
  const [factoryId, setFactoryId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<Employee | null>(null);
  const [confirm, setConfirm] = React.useState<{ id: string; label: string } | null>(null);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees
      .filter((e) => (factoryId ? e.factoryId === factoryId : true))
      .filter((e) => {
        if (!q) return true;
        const hay = `${e.name} ${e.employeeId} ${e.department} ${e.designation}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.employeeId > b.employeeId ? 1 : -1));
  }, [employees, search, factoryId]);

  const columns: Array<DataColumn<Employee>> = [
    {
      id: "name",
      header: "Employee",
      cell: (e) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{e.name}</div>
          <div className="text-muted-foreground mt-0.5 text-xs">
            ID {e.employeeId} • {e.department}
          </div>
        </div>
      ),
    },
    {
      id: "factory",
      header: "Factory",
      cell: (e) => <div className="text-sm">{getFacilityName(e.factoryId)}</div>,
      className: "hidden lg:table-cell",
    },
    {
      id: "designation",
      header: "Designation",
      cell: (e) => <div className="text-sm">{e.designation}</div>,
      className: "hidden xl:table-cell",
    },
    {
      id: "status",
      header: "Status",
      cell: (e) => (
        <StatusBadge tone={e.status === "active" ? "compliant" : "neutral"}>
          {e.status}
        </StatusBadge>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <CreateActionDialog
          title="Create employee"
          triggerLabel="Create"
          submitLabel="Create"
          contentClassName="sm:max-w-2xl"
          onCreate={() => {
            const id = createId("emp");
            const emp: Employee = {
              id,
              name: "",
              employeeId: String(Math.floor(700000 + Math.random() * 99999)),
              factoryId: facilities[0]?.id ?? "fac_hfl",
              department: "EHS",
              designation: "Officer",
              status: "active",
              joinedOn: new Date().toISOString().slice(0, 10),
            };
            upsertEmployee(emp);
            setSelected(emp);
          }}
        >
          <div className="rounded-xl border bg-muted/10 p-3 text-sm">
            Create opens the right panel to complete details.
          </div>
        </CreateActionDialog>
      </div>

      <FilterBar
        left={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[360px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search employees..." />
            </div>
            <SelectFilter
              value={factoryId}
              onChange={setFactoryId}
              placeholder="Factory"
              items={facilities.map((f) => ({ value: f.id, label: f.name }))}
            />
          </div>
        }
        onClear={() => {
          setSearch("");
          setFactoryId(undefined);
        }}
      />

      <SectionCard title="Employees" description="Directory used by Users and ownership fields across the EMS.">
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} onRowClick={setSelected} />
      </SectionCard>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(o) => (!o ? setSelected(null) : null)}
        title="Employee"
        description={selected ? `ID ${selected.employeeId}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Name</div>
                <Input
                  value={selected.name}
                  onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                  placeholder="Employee name"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Employee ID</div>
                <Input
                  value={selected.employeeId}
                  onChange={(e) =>
                    setSelected({ ...selected, employeeId: e.target.value.replace(/\s+/g, "") })
                  }
                  placeholder="700901"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Factory</div>
                <SelectFilter
                  value={selected.factoryId}
                  onChange={(v) => setSelected({ ...selected, factoryId: v || selected.factoryId })}
                  placeholder="Select factory"
                  items={facilities.map((f) => ({ value: f.id, label: f.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Department</div>
                <Input
                  value={selected.department}
                  onChange={(e) => setSelected({ ...selected, department: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Designation</div>
                <Input
                  value={selected.designation}
                  onChange={(e) => setSelected({ ...selected, designation: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="destructive"
                onClick={() => setConfirm({ id: selected.id, label: selected.name || "Employee" })}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
              <Button
                onClick={() => {
                  if (!selected.name.trim()) return toast.error("Name is required");
                  if (!selected.employeeId.trim()) return toast.error("Employee ID is required");
                  upsertEmployee(selected);
                  toast.success("Saved");
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </DetailPanel>

      <ActionModal
        open={Boolean(confirm)}
        onOpenChange={(o) => (!o ? setConfirm(null) : null)}
        tone="destructive"
        title={`Delete ${confirm?.label || "employee"}?`}
        description="This will remove the employee from the local settings store."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!confirm) return;
          removeEmployee(confirm.id);
          setSelected(null);
          setConfirm(null);
          toast.success("Deleted");
        }}
      />
    </div>
  );
}
