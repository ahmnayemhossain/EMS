import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { facilities } from "@/data/mock";
import { seedDepartments, seedDesignations } from "@/data/admin";
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

function getDepartmentName(id: string) {
  return seedDepartments.find((department) => department.id === id)?.name ?? id;
}

function getDesignationName(id: string) {
  return seedDesignations.find((designation) => designation.id === id)?.name ?? id;
}

function nextEmployeeId(employees: Employee[]) {
  const max = employees.reduce((highest, employee) => Math.max(highest, Number(employee.employeeId) || 0), 1000);
  return max + 1;
}

function createBlankEmployee(employees: Employee[]): Employee {
  const employeeId = nextEmployeeId(employees);
  const departmentId = seedDepartments[0]?.id ?? "dept_ehs";
  const designationId = seedDesignations[0]?.id ?? "desig_officer";

  return {
    id: createId("emp"),
    name: "",
    employeeId,
    factoryId: facilities[0]?.id ?? "fac_garments_a",
    departmentId,
    designationId,
    department: getDepartmentName(departmentId),
    designation: getDesignationName(designationId),
    status: 1,
    email: "",
    phone: "",
    joinedOn: new Date().toISOString().slice(0, 10),
  };
}

function normalizeEmployee(employee: Employee): Employee {
  return {
    ...employee,
    employeeId: Number(employee.employeeId),
    department: getDepartmentName(employee.departmentId),
    designation: getDesignationName(employee.designationId),
    phone: employee.phone?.trim() || undefined,
  };
}

export function EmployeesModule() {
  const { employees, upsertEmployee, removeEmployee } = useAdmin();
  const [search, setSearch] = React.useState("");
  const [factoryId, setFactoryId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<Employee | null>(null);
  const [confirm, setConfirm] = React.useState<{ id: string; label: string } | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Employee>(() => createBlankEmployee(employees));

  React.useEffect(() => {
    if (createOpen) setDraft(createBlankEmployee(employees));
  }, [createOpen, employees]);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees
      .filter((e) => (factoryId ? e.factoryId === factoryId : true))
      .filter((e) => {
        if (!q) return true;
        const hay = `${e.name} ${e.employeeId} ${getDepartmentName(e.departmentId)} ${getDesignationName(e.designationId)} ${e.email} ${e.phone ?? ""}`.toLowerCase();
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
            ID {e.employeeId} • {getDepartmentName(e.departmentId)}
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
      cell: (e) => <div className="text-sm">{getDesignationName(e.designationId)}</div>,
      className: "hidden xl:table-cell",
    },
    {
      id: "status",
      header: "Status",
      cell: (e) => (
        <StatusBadge tone={e.status === 1 ? "compliant" : "neutral"}>
          {e.status === 1 ? "active" : "inactive"}
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
          open={createOpen}
          onOpenChange={setCreateOpen}
          contentClassName="sm:max-w-2xl"
          onCreate={() => {
            const employee = normalizeEmployee(draft);
            if (!employee.name.trim()) return toast.error("Name is required"), false;
            if (!Number.isFinite(employee.employeeId) || employee.employeeId <= 0) {
              return toast.error("Employee ID must be a number"), false;
            }
            if (employees.some((row) => row.employeeId === employee.employeeId)) {
              return toast.error("Employee ID already exists"), false;
            }
            if (!employee.email.trim()) return toast.error("Email is required"), false;
            if (employees.some((row) => row.email.toLowerCase() === employee.email.toLowerCase())) {
              return toast.error("Email already exists"), false;
            }
            upsertEmployee(employee);
            setSelected(employee);
            toast.success("Employee created");
            return true;
          }}
        >
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Employee ID</div>
                <Input
                  type="number"
                  value={draft.employeeId}
                  onChange={(e) => setDraft({ ...draft, employeeId: Number(e.target.value) })}
                  placeholder="1001"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Name</div>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Employee name"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Email</div>
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="employee@example.com"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Phone</div>
                <Input
                  value={draft.phone ?? ""}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Factory</div>
                <SelectFilter
                  value={draft.factoryId}
                  onChange={(v) => setDraft({ ...draft, factoryId: v || draft.factoryId })}
                  placeholder="Factory"
                  items={facilities.map((f) => ({ value: f.id, label: f.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Department</div>
                <SelectFilter
                  value={draft.departmentId}
                  onChange={(v) => setDraft({ ...draft, departmentId: v || draft.departmentId })}
                  placeholder="Department"
                  items={seedDepartments.map((department) => ({ value: department.id, label: department.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Designation</div>
                <SelectFilter
                  value={draft.designationId}
                  onChange={(v) => setDraft({ ...draft, designationId: v || draft.designationId })}
                  placeholder="Designation"
                  items={seedDesignations.map((designation) => ({ value: designation.id, label: designation.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Active status</div>
                <SelectFilter
                  value={String(draft.status)}
                  onChange={(v) => setDraft({ ...draft, status: v === "1" ? 1 : 0 })}
                  placeholder="Status"
                  items={[
                    { value: "1", label: "Active (1)" },
                    { value: "0", label: "Inactive (0)" },
                  ]}
                />
              </div>
            </div>
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
                  type="number"
                  value={selected.employeeId}
                  onChange={(e) =>
                    setSelected({ ...selected, employeeId: Number(e.target.value) })
                  }
                  placeholder="1001"
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
                <SelectFilter
                  value={selected.departmentId}
                  onChange={(v) => setSelected({ ...selected, departmentId: v || selected.departmentId })}
                  placeholder="Department"
                  items={seedDepartments.map((department) => ({ value: department.id, label: department.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Designation</div>
                <SelectFilter
                  value={selected.designationId}
                  onChange={(v) => setSelected({ ...selected, designationId: v || selected.designationId })}
                  placeholder="Designation"
                  items={seedDesignations.map((designation) => ({ value: designation.id, label: designation.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Email</div>
                <Input
                  type="email"
                  value={selected.email}
                  onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                  placeholder="employee@example.com"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Phone</div>
                <Input
                  value={selected.phone ?? ""}
                  onChange={(e) => setSelected({ ...selected, phone: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Active status</div>
                <SelectFilter
                  value={String(selected.status)}
                  onChange={(v) => setSelected({ ...selected, status: v === "1" ? 1 : 0 })}
                  placeholder="Status"
                  items={[
                    { value: "1", label: "Active (1)" },
                    { value: "0", label: "Inactive (0)" },
                  ]}
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
                  if (!Number.isFinite(selected.employeeId) || selected.employeeId <= 0) {
                    return toast.error("Employee ID must be a number");
                  }
                  if (!selected.email.trim()) return toast.error("Email is required");
                  upsertEmployee(normalizeEmployee(selected));
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
