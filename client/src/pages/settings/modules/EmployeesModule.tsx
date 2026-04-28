import * as React from "react";
import { Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "@/app/lib/toast";

import type { Employee } from "@/types/admin";
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
  createEmployee,
  deleteEmployee,
  listEmployeeLookups,
  listEmployees,
  type EmployeeLookupOption,
  updateEmployee,
} from "./employeesApi";

type EmployeeRow = Employee & {
  createdByUserName?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

type EmployeeLookups = {
  facilities: EmployeeLookupOption[];
  departments: EmployeeLookupOption[];
  designations: EmployeeLookupOption[];
};

type EmployeeValidationErrors = Partial<Record<
  "employeeId" | "name" | "email" | "companyId" | "departmentId" | "designationId" | "status",
  string
>>;

function createId(prefix: string) {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

function getOptionName(options: EmployeeLookupOption[], id?: string) {
  if (!id) return "-";
  return options.find((option) => option.id === id)?.name ?? id;
}

function nextEmployeeId(employees: Employee[]) {
  const max = employees.reduce((highest, employee) => Math.max(highest, Number(employee.employeeId) || 0), 1000);
  return max + 1;
}

function createBlankEmployee(employees: Employee[], lookups: EmployeeLookups): Employee {
  return {
    id: createId("emp"),
    name: "",
    employeeId: nextEmployeeId(employees),
    companyId: lookups.facilities[0]?.id ?? "",
    departmentId: lookups.departments[0]?.id ?? "",
    designationId: lookups.designations[0]?.id ?? "",
    status: 1,
    email: "",
    phone: "",
    joinedOn: "",
  };
}

function normalizeEmployee(employee: Employee, lookups: EmployeeLookups): Employee {
  return {
    ...employee,
    employeeId: Number(employee.employeeId),
    department: getOptionName(lookups.departments, employee.departmentId),
    designation: getOptionName(lookups.designations, employee.designationId),
    phone: employee.phone?.trim() || undefined,
    joinedOn: employee.joinedOn?.trim() || undefined,
  };
}

function getEmployeeValidationErrors(employee: Employee, employees: Employee[], currentId?: string) {
  const errors: EmployeeValidationErrors = {};

  if (!Number.isFinite(employee.employeeId) || employee.employeeId <= 0) {
    errors.employeeId = "Employee ID must be a number";
  } else if (employees.some((row) => row.id !== currentId && row.employeeId === employee.employeeId)) {
    errors.employeeId = "Employee ID already exists";
  }

  if (!employee.name.trim()) errors.name = "Name is required";
  if (!employee.email.trim()) {
    errors.email = "Email is required";
  } else if (employees.some((row) => row.id !== currentId && row.email.toLowerCase() === employee.email.toLowerCase())) {
    errors.email = "Email already exists";
  }
  if (!employee.companyId) errors.companyId = "Company is required";
  if (!employee.departmentId) errors.departmentId = "Department is required";
  if (!employee.designationId) errors.designationId = "Designation is required";
  if (![0, 1].includes(Number(employee.status))) errors.status = "Status is required";

  return errors;
}

function firstValidationMessage(errors: EmployeeValidationErrors) {
  return Object.values(errors)[0] ?? null;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return value.slice(0, 10);
}

function EmployeeForm({
  value,
  onChange,
  lookups,
  errors = {},
}: {
  value: Employee;
  onChange: (employee: Employee) => void;
  lookups: EmployeeLookups;
  errors?: EmployeeValidationErrors;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Employee ID" required error={errors.employeeId}>
          <Input
            type="number"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.employeeId) || undefined}
            value={value.employeeId}
            onChange={(e) => onChange({ ...value, employeeId: Number(e.target.value) })}
            placeholder="1001"
          />
        </Field>
        <Field label="Name" required error={errors.name}>
          <Input
            required
            aria-required="true"
            aria-invalid={Boolean(errors.name) || undefined}
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="Employee name"
          />
        </Field>
        <Field label="Email" required error={errors.email}>
          <Input
            type="email"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.email) || undefined}
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            placeholder="employee@example.com"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={value.phone ?? ""}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="Optional"
          />
        </Field>
        <Field label="Company" required error={errors.companyId}>
          <SelectFilter
            value={value.companyId || undefined}
            onChange={(v) => onChange({ ...value, companyId: v || value.companyId })}
            placeholder="Company"
            items={lookups.facilities.map((f) => ({ value: f.id, label: f.name }))}
            invalid={Boolean(errors.companyId)}
            className="w-full"
          />
        </Field>
        <Field label="Department" required error={errors.departmentId}>
          <SelectFilter
            value={value.departmentId || undefined}
            onChange={(v) => onChange({ ...value, departmentId: v || value.departmentId })}
            placeholder="Department"
            items={lookups.departments.map((department) => ({ value: department.id, label: department.name }))}
            invalid={Boolean(errors.departmentId)}
            className="w-full"
          />
        </Field>
        <Field label="Designation" required error={errors.designationId}>
          <SelectFilter
            value={value.designationId || undefined}
            onChange={(v) => onChange({ ...value, designationId: v || value.designationId })}
            placeholder="Designation"
            items={lookups.designations.map((designation) => ({ value: designation.id, label: designation.name }))}
            invalid={Boolean(errors.designationId)}
            className="w-full"
          />
        </Field>
        <Field label="Active status" required error={errors.status}>
          <SelectFilter
            value={String(value.status)}
            onChange={(v) => onChange({ ...value, status: v === "1" ? 1 : 0 })}
            placeholder="Status"
            invalid={Boolean(errors.status)}
            className="w-full"
            items={[
              { value: "1", label: "Active" },
              { value: "0", label: "Inactive" },
            ]}
          />
        </Field>
        <Field label="Date of joining" hint="Optional">
          <Input
            type="date"
            value={value.joinedOn ?? ""}
            onChange={(e) => onChange({ ...value, joinedOn: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {label}
          {required ? <span className="ml-1 font-semibold text-destructive">*</span> : null}
        </span>
        {hint ? <span>{hint}</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs font-medium text-destructive">{error}</span> : null}
    </label>
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

function AvatarInitials({ label }: { label?: string }) {
  const initials = String(label || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials || "?"}
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
        <div className="mt-3 text-base font-semibold">Delete {label || "employee"}?</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          This will remove the employee from the database and write a delete log.
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

export function EmployeesModule() {
  const { userId } = useUser();
  const [employees, setEmployees] = React.useState<EmployeeRow[]>([]);
  const [facilities, setFacilities] = React.useState<EmployeeLookupOption[]>([]);
  const [departments, setDepartments] = React.useState<EmployeeLookupOption[]>([]);
  const [designations, setDesignations] = React.useState<EmployeeLookupOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<EmployeeRow | null>(null);
  const [editDraft, setEditDraft] = React.useState<Employee | null>(null);
  const [editErrors, setEditErrors] = React.useState<EmployeeValidationErrors>({});
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createErrors, setCreateErrors] = React.useState<EmployeeValidationErrors>({});
  const lookups = React.useMemo(
    () => ({ facilities, departments, designations }),
    [departments, designations, facilities],
  );
  const [draft, setDraft] = React.useState<Employee>(() =>
    createBlankEmployee([], { facilities: [], departments: [], designations: [] }),
  );

  const loadEmployees = React.useCallback(async () => {
    try {
      setLoading(true);
      const [nextEmployees, nextLookups] = await Promise.all([
        listEmployees(userId),
        listEmployeeLookups(),
      ]);
      setEmployees(nextEmployees);
      setFacilities(nextLookups.facilities);
      setDepartments(nextLookups.departments);
      setDesignations(nextLookups.designations);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load employees");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  React.useEffect(() => {
    if (createOpen) {
      setDraft(createBlankEmployee(employees, lookups));
      setCreateErrors({});
    }
  }, [createOpen, employees, lookups]);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees
      .filter((e) => (companyId ? e.companyId === companyId : true))
      .filter((e) => {
        if (!q) return true;
        const hay = `${e.name} ${e.employeeId} ${getOptionName(departments, e.departmentId)} ${getOptionName(designations, e.designationId)} ${e.email} ${e.phone ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.employeeId > b.employeeId ? 1 : -1));
  }, [departments, designations, employees, search, companyId]);

  const columns: Array<DataColumn<EmployeeRow>> = [
    {
      id: "name",
      header: "Employee",
      cell: (e) => (
        <div className="flex min-w-0 items-center gap-3">
          <AvatarInitials label={e.name} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{e.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              ID {e.employeeId} - {getOptionName(departments, e.departmentId)}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "company",
      header: "Company",
      cell: (e) => <div className="text-sm">{getOptionName(facilities, e.companyId)}</div>,
      className: "hidden lg:table-cell",
    },
    {
      id: "designation",
      header: "Designation",
      cell: (e) => <div className="text-sm">{getOptionName(designations, e.designationId)}</div>,
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

  function openDetails(employee: EmployeeRow) {
    setSelected(employee);
    setEditDraft(null);
    setEditErrors({});
    setConfirmDelete(false);
  }

  async function saveEdit() {
    if (!editDraft || !selected) return;
    const employee = normalizeEmployee(editDraft, lookups);
    const errors = getEmployeeValidationErrors(employee, employees, selected.id);
    setEditErrors(errors);
    const validation = firstValidationMessage(errors);
    if (validation) return toast.error(validation);

    try {
      const updated = await updateEmployee(employee, userId);
      setEmployees((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      setSelected(updated);
      setEditDraft(null);
      setEditErrors({});
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Employee save failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadEmployees()} disabled={loading}>
          <RefreshCw className="size-4" />
        </Button>
        <CreateActionDialog
          title="Create employee"
          triggerLabel="Create"
          submitLabel="Create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          contentClassName="sm:max-w-2xl"
          onCreate={async () => {
            const employee = normalizeEmployee(draft, lookups);
            const errors = getEmployeeValidationErrors(employee, employees);
            setCreateErrors(errors);
            const validation = firstValidationMessage(errors);
            if (validation) return toast.error(validation), false;

            try {
              const created = await createEmployee(employee, userId);
              setEmployees((rows) => [created, ...rows]);
              setCreateErrors({});
              toast.success("Employee created");
              return true;
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Employee create failed");
              return false;
            }
          }}
        >
          <EmployeeForm
            value={draft}
            onChange={(employee) => {
              setDraft(employee);
              if (Object.keys(createErrors).length) setCreateErrors({});
            }}
            lookups={lookups}
            errors={createErrors}
          />
        </CreateActionDialog>
      </div>

      <FilterBar
        left={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[360px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search employees..." />
            </div>
            <SelectFilter
              value={companyId}
              onChange={setCompanyId}
              placeholder="Company"
              items={facilities.map((f) => ({ value: f.id, label: f.name }))}
            />
          </div>
        }
        onClear={() => {
          setSearch("");
          setCompanyId(undefined);
        }}
      />

      <SectionCard title="Employees" description="Directory used by Users and ownership fields across the EMS.">
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading employees from database...</div> : null}
        {!loading && rows.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No employees found in database.</div>
        ) : null}
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} onRowClick={openDetails} />
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
        title={editDraft ? "Edit employee" : "Employee"}
        description={selected ? `ID ${selected.employeeId}` : undefined}
        overlay={
          selected && confirmDelete ? (
            <DrawerDeleteConfirm
              label={selected.name}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={async () => {
                await deleteEmployee(selected.id, userId);
                setEmployees((rows) => rows.filter((employee) => employee.id !== selected.id));
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
              <EmployeeForm
                value={editDraft}
                onChange={(employee) => {
                  setEditDraft(employee);
                  if (Object.keys(editErrors).length) setEditErrors({});
                }}
                lookups={lookups}
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
                <DetailRow label="Employee ID">{selected.employeeId}</DetailRow>
                <DetailRow label="Company">{getOptionName(facilities, selected.companyId)}</DetailRow>
                <DetailRow label="Department">{getOptionName(departments, selected.departmentId)}</DetailRow>
                <DetailRow label="Designation">{getOptionName(designations, selected.designationId)}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge tone={selected.status === 1 ? "compliant" : "neutral"}>
                    {selected.status === 1 ? "active" : "inactive"}
                  </StatusBadge>
                </DetailRow>
                <DetailRow label="Email">{selected.email}</DetailRow>
                <DetailRow label="Phone">{selected.phone || "-"}</DetailRow>
                <DetailRow label="Date of joining">{formatDate(selected.joinedOn)}</DetailRow>
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
