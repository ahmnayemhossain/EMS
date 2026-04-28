import * as React from "react";
import { Check, ChevronsUpDown, KeyRound, Pencil, RefreshCw, Search, Trash2, X } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/app/components/ui/utils";
import { useUser } from "@/app/state/user";
import { SectionCard } from "@/components/SectionCard";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { DetailPanel } from "@/components/DetailPanel";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { StatusBadge } from "@/components/StatusBadge";
import {
  createUser,
  deleteUser,
  listUserLookups,
  listUsers,
  resetUserPassword,
  type UserEmployeeOption,
  type UserInput,
  updateUser,
} from "./usersApi";

type UserValidationErrors = Partial<Record<"employeeDbId" | "username" | "email" | "companyAccessIds" | "roleIds", string>>;

function blankUser(employees: UserEmployeeOption[], roleIds: string[]): UserInput {
  return {
    id: "",
    employeeDbId: "",
    employeeId: 0,
    username: "",
    email: "",
    companyAccessIds: [],
    roleIds: roleIds.length ? [roleIds[0]] : [],
    status: "active",
  };
}

function validateUser(user: UserInput, users: UserInput[], currentId?: string) {
  const errors: UserValidationErrors = {};
  if (!user.employeeDbId) errors.employeeDbId = "Employee is required";
  if (!user.username.trim()) {
    errors.username = "Username is required";
  } else if (users.some((row) => row.id !== currentId && row.username.toLowerCase() === user.username.toLowerCase())) {
    errors.username = "Username already exists";
  }
  if (!user.email.trim()) {
    errors.email = "Email is required";
  } else if (users.some((row) => row.id !== currentId && row.email.toLowerCase() === user.email.toLowerCase())) {
    errors.email = "Email already exists";
  }
  if (!user.roleIds.length) errors.roleIds = "At least one role is required";
  if (!user.companyAccessIds?.length) errors.companyAccessIds = "At least one company access is required";
  return errors;
}

function firstError(errors: UserValidationErrors) {
  return Object.values(errors)[0] ?? null;
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
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

function EmployeeSelect({
  value,
  employees,
  invalid,
  onChange,
}: {
  value?: string;
  employees: UserEmployeeOption[];
  invalid?: boolean;
  onChange: (employeeDbId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const selectedEmployee = employees.find((employee) => employee.id === value);
  const query = search.trim().toLowerCase();
  const options = employees
    .filter((employee) => {
      if (!query) return true;
      return `${employee.employeeId} ${employee.name} ${employee.email} ${employee.companyName ?? ""}`
        .toLowerCase()
        .includes(query);
    })
    .slice(0, 10);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-invalid={invalid || undefined}
          className={cn(
            "h-10 w-full justify-between px-3 text-left font-normal",
            invalid && "border-destructive ring-[3px] ring-destructive/20",
          )}
        >
          {selectedEmployee ? (
            <span className="flex min-w-0 items-center gap-2">
              <AvatarInitials label={selectedEmployee.name} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{selectedEmployee.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  ID {selectedEmployee.employeeId} - {selectedEmployee.companyName || "No company"}
                </span>
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select employee</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee ID or name"
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {options.map((employee) => (
            <button
              key={employee.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-muted",
                employee.id === value && "bg-muted",
              )}
              onClick={() => {
                onChange(employee.id);
                setOpen(false);
                setSearch("");
              }}
            >
              <AvatarInitials label={employee.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{employee.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  ID {employee.employeeId} - {employee.companyName || "No company"}
                </span>
              </span>
              <Check className={cn("size-4 shrink-0", employee.id === value ? "opacity-100" : "opacity-0")} />
            </button>
          ))}
          {!options.length ? <div className="px-3 py-6 text-center text-sm text-muted-foreground">No employee found.</div> : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FacilityAccessSelect({
  value,
  facilities,
  invalid,
  onChange,
}: {
  value: string[];
  facilities: Array<{ id: string; name: string }>;
  invalid?: boolean;
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = facilities.filter((facility) => value.includes(facility.id));
  const label = selected.length
    ? selected.length === 1
      ? selected[0].name
      : `${selected[0].name} +${selected.length - 1}`
    : "Select company access";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-invalid={invalid || undefined}
          className={cn(
            "h-10 w-full justify-between px-3 text-left font-normal",
            invalid && "border-destructive ring-[3px] ring-destructive/20",
          )}
        >
          <span className={cn("truncate", !selected.length && "text-muted-foreground")}>{label}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1">
        <div className="max-h-64 overflow-y-auto">
          {facilities.map((facility) => {
            const checked = value.includes(facility.id);
            return (
              <button
                key={facility.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                  checked && "bg-muted",
                )}
                onClick={() => {
                  const next = checked
                    ? value.filter((id) => id !== facility.id)
                    : Array.from(new Set([...value, facility.id]));
                  onChange(next);
                }}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded border",
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
                  )}
                >
                  {checked ? <Check className="size-3" /> : null}
                </span>
                <span className="truncate font-medium">{facility.name}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
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
        <div className="mt-3 text-base font-semibold">Delete {label || "user"}?</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          This will remove the user from the database.
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

function UserForm({
  value,
  onChange,
  employees,
  roles,
  facilities,
  errors = {},
}: {
  value: UserInput;
  onChange: (user: UserInput) => void;
  employees: UserEmployeeOption[];
  roles: Array<{ id: string; name: string; description?: string }>;
  facilities: Array<{ id: string; name: string }>;
  errors?: UserValidationErrors;
}) {
  function setEmployee(employeeDbId: string) {
    const employee = employees.find((row) => row.id === employeeDbId);
    onChange({
      ...value,
      employeeDbId,
      employeeId: employee?.employeeId ?? value.employeeId,
      username: employee?.employeeId ? String(employee.employeeId) : "",
      email: employee?.email || "",
      companyAccessIds: employee?.companyId ? [employee.companyId] : [],
    });
  }

  const selectedEmployee = employees.find((employee) => employee.id === value.employeeDbId);
  const username = selectedEmployee?.employeeId ? String(selectedEmployee.employeeId) : value.username;
  const email = selectedEmployee?.email || value.email;

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Employee" required error={errors.employeeDbId}>
          <EmployeeSelect
            value={value.employeeDbId}
            employees={employees}
            invalid={Boolean(errors.employeeDbId)}
            onChange={setEmployee}
          />
        </Field>
        <Field label="Status" required>
          <SelectFilter
            value={value.status}
            onChange={(status) => onChange({ ...value, status: status === "suspended" ? "suspended" : "active" })}
            placeholder="Status"
            className="w-full"
            items={[
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
            ]}
          />
        </Field>
        <Field label="Username" required error={errors.username}>
          <Input
            value={username}
            readOnly
            aria-invalid={Boolean(errors.username) || undefined}
            className="bg-muted/40"
            placeholder="Auto from employee ID"
          />
        </Field>
        <Field label="Email" required error={errors.email}>
          <Input
            type="email"
            value={email}
            readOnly
            aria-invalid={Boolean(errors.email) || undefined}
            className="bg-muted/40"
            placeholder="Auto from employee email"
          />
        </Field>
        <Field label="Company access" required error={errors.companyAccessIds} className="sm:col-span-2">
          <FacilityAccessSelect
            value={value.companyAccessIds ?? []}
            facilities={facilities}
            invalid={Boolean(errors.companyAccessIds)}
            onChange={(companyAccessIds) => onChange({ ...value, companyAccessIds })}
          />
        </Field>
      </div>

      <Field label="Roles" required error={errors.roleIds}>
        <div
          className={
            errors.roleIds
              ? "grid gap-2 rounded-lg border border-destructive p-3 ring-[3px] ring-destructive/20"
              : "grid gap-2 rounded-lg border p-3"
          }
        >
          {roles.map((role) => {
            const checked = value.roleIds.includes(role.id);
            return (
              <label key={role.id} className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 accent-destructive"
                  checked={checked}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? Array.from(new Set([...value.roleIds, role.id]))
                      : value.roleIds.filter((id) => id !== role.id);
                    onChange({ ...value, roleIds: next });
                  }}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{role.name}</span>
                  {role.description ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">{role.description}</span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

export function UsersModule() {
  const { userId } = useUser();
  const [users, setUsers] = React.useState<UserInput[]>([]);
  const [employees, setEmployees] = React.useState<UserEmployeeOption[]>([]);
  const [roles, setRoles] = React.useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [facilities, setFacilities] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<UserInput | null>(null);
  const [editDraft, setEditDraft] = React.useState<UserInput | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<UserInput>(() => blankUser([], []));
  const [createErrors, setCreateErrors] = React.useState<UserValidationErrors>({});
  const [editErrors, setEditErrors] = React.useState<UserValidationErrors>({});

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const [nextUsers, lookups] = await Promise.all([listUsers(userId), listUserLookups()]);
      setUsers(nextUsers);
      setEmployees(lookups.employees);
      setRoles(lookups.roles);
      setFacilities(lookups.facilities);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  React.useEffect(() => {
    if (createOpen) {
      setDraft(blankUser(employees, roles.map((role) => role.id)));
      setCreateErrors({});
    }
  }, [createOpen, employees, roles]);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((user) => (companyId ? user.companyAccessIds?.includes(companyId) || user.companyId === companyId : true))
      .filter((user) => {
        if (!q) return true;
        const hay = `${user.username} ${user.email} ${user.employeeId} ${user.employeeName || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.username > b.username ? 1 : -1));
  }, [companyId, search, users]);

  const columns: Array<DataColumn<UserInput>> = [
    {
      id: "user",
      header: "User",
      cell: (user) => (
        <div className="flex min-w-0 items-center gap-3">
          <AvatarInitials label={user.employeeName || user.username} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {user.employeeName || "Unknown"}{" "}
              <span className="font-normal text-muted-foreground">({user.username})</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {user.email} - ID {user.employeeId}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "roles",
      header: "Roles",
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roleIds.slice(0, 2).map((id) => (
            <StatusBadge key={id} tone="neutral">
              {roles.find((role) => role.id === id)?.name || "Role"}
            </StatusBadge>
          ))}
          {user.roleIds.length > 2 ? <StatusBadge tone="neutral">+{user.roleIds.length - 2}</StatusBadge> : null}
        </div>
      ),
      className: "hidden lg:table-cell",
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => (
        <StatusBadge tone={user.status === "active" ? "compliant" : "warning"}>
          {user.status}
        </StatusBadge>
      ),
      className: "text-right",
    },
  ];

  function openDetails(user: UserInput) {
    setSelected(user);
    setEditDraft(null);
    setEditErrors({});
    setConfirmDelete(false);
  }

  async function saveEdit() {
    if (!selected || !editDraft) return;
    const errors = validateUser(editDraft, users, selected.id);
    setEditErrors(errors);
    const message = firstError(errors);
    if (message) return toast.error(message);

    try {
      const updated = await updateUser(editDraft, userId);
      setUsers((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      setSelected(updated);
      setEditDraft(null);
      setEditErrors({});
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "User save failed");
    }
  }

  async function resetPassword(user: UserInput) {
    try {
      const result = await resetUserPassword(user.id, userId);
      toast.success(`Password reset to ${result.password}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadUsers()} disabled={loading}>
          <RefreshCw className="size-4" />
        </Button>
        <CreateActionDialog
          title="Create user"
          triggerLabel="Create"
          submitLabel="Create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          contentClassName="sm:max-w-2xl"
          onCreate={async () => {
            const errors = validateUser(draft, users);
            setCreateErrors(errors);
            const message = firstError(errors);
            if (message) return toast.error(message), false;

            try {
              const created = await createUser(draft, userId);
              setUsers((rows) => [created, ...rows]);
              setCreateErrors({});
              toast.success("User created");
              return true;
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "User create failed");
              return false;
            }
          }}
        >
          <UserForm
            value={draft}
            onChange={(user) => {
              setDraft(user);
              if (Object.keys(createErrors).length) setCreateErrors({});
            }}
            employees={employees}
            roles={roles}
            facilities={facilities}
            errors={createErrors}
          />
        </CreateActionDialog>
      </div>

      <FilterBar
        left={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[360px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
            </div>
            <SelectFilter
              value={companyId}
              onChange={setCompanyId}
              placeholder="Company"
              items={facilities.map((facility) => ({ value: facility.id, label: facility.name }))}
            />
          </div>
        }
        onClear={() => {
          setSearch("");
          setCompanyId(undefined);
        }}
      />

      <SectionCard title="Users" description="Application accounts and access status.">
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading users from database...</div> : null}
        {!loading && rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No users found.</div> : null}
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          onRowClick={openDetails}
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
        title={editDraft ? "Edit user" : "User"}
        description={selected ? selected.username || "New user" : undefined}
        overlay={
          selected && confirmDelete ? (
            <DrawerDeleteConfirm
              label={selected.username}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={async () => {
                await deleteUser(selected.id, userId);
                setUsers((rows) => rows.filter((user) => user.id !== selected.id));
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
              <UserForm
                value={editDraft}
                onChange={(user) => {
                  setEditDraft(user);
                  if (Object.keys(editErrors).length) setEditErrors({});
                }}
                employees={employees}
                roles={roles}
                facilities={facilities}
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
                <DetailRow label="Employee">{selected.employeeName || "-"}</DetailRow>
                <DetailRow label="Employee ID">{selected.employeeId || "-"}</DetailRow>
                <DetailRow label="Company">{selected.companyName || "-"}</DetailRow>
                <DetailRow label="Username">{selected.username}</DetailRow>
                <DetailRow label="Email">{selected.email}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge tone={selected.status === "active" ? "compliant" : "warning"}>
                    {selected.status}
                  </StatusBadge>
                </DetailRow>
                <DetailRow label="Company access">
                  <div className="flex flex-wrap justify-end gap-1">
                    {selected.companyAccessIds?.length ? (
                      selected.companyAccessIds.map((id) => (
                        <StatusBadge key={id} tone="neutral">
                          {facilities.find((facility) => facility.id === id)?.name || "Company"}
                        </StatusBadge>
                      ))
                    ) : (
                      "-"
                    )}
                  </div>
                </DetailRow>
                <DetailRow label="Roles">
                  <div className="flex flex-wrap justify-end gap-1">
                    {selected.roleIds.length ? (
                      selected.roleIds.map((id) => (
                        <StatusBadge key={id} tone="neutral">
                          {roles.find((role) => role.id === id)?.name || "Role"}
                        </StatusBadge>
                      ))
                    ) : (
                      "-"
                    )}
                  </div>
                </DetailRow>
                <DetailRow label="Created by">{selected.createdByUserName || "-"}</DetailRow>
                <DetailRow label="Updated by">{selected.updatedByUserName || "-"}</DetailRow>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => void resetPassword(selected)}>
                    <KeyRound className="mr-2 size-4" />
                    Reset
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
            </div>
          )
        ) : null}
      </DetailPanel>
    </div>
  );
}
