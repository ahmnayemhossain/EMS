import * as React from "react";
import { Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { useUser } from "@/app/state/user";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/components/ui/utils";
import { SectionCard } from "@/components/SectionCard";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { DetailPanel } from "@/components/DetailPanel";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { SelectFilter } from "@/components/SelectFilter";
import {
  createRole,
  deleteRole,
  listRoleLookups,
  listRoles,
  type RoleEntity,
  updateRole,
} from "./settingsEntityApi";

type RoleValidationErrors = Partial<Record<"name" | "permissionKeys" | "status", string>>;
type PermissionOption = {
  key: string;
  label: string;
  group?: string;
  action?: string;
};
const permissionColumns = ["read", "write", "update", "delete"] as const;
const permissionColumnLabels: Record<(typeof permissionColumns)[number], string> = {
  read: "Read",
  write: "Write",
  update: "Update",
  delete: "Delete",
};

function blankRole(permissionKeys: string[]): RoleEntity {
  return {
    id: "",
    name: "",
    scope: "company",
    description: "",
    permissionKeys: permissionKeys.length ? [permissionKeys[0]] : [],
    status: 1,
  };
}

function validateRole(role: RoleEntity, roles: RoleEntity[], currentId?: string) {
  const errors: RoleValidationErrors = {};
  if (!role.name.trim()) {
    errors.name = "Role name is required";
  } else if (roles.some((row) => row.id !== currentId && row.name.toLowerCase() === role.name.toLowerCase())) {
    errors.name = "Role name already exists";
  }
  if (!role.permissionKeys.length) errors.permissionKeys = "At least one permission is required";
  if (![0, 1].includes(Number(role.status))) errors.status = "Status is required";
  return errors;
}

function firstError(errors: RoleValidationErrors) {
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

function groupPermissions(permissions: PermissionOption[]) {
  const groups: Array<{
    name: string;
    permissions: Partial<Record<(typeof permissionColumns)[number], PermissionOption>>;
  }> = [];
  const byName = new Map<string, Partial<Record<(typeof permissionColumns)[number], PermissionOption>>>();

  for (const permission of permissions) {
    const group = permission.group || permission.label.split(" - ")[0] || "Other";
    const action = (permission.action || permission.key.split(":").pop() || "").toLowerCase();
    if (!permissionColumns.includes(action as (typeof permissionColumns)[number])) continue;

    if (!byName.has(group)) {
      byName.set(group, {});
      groups.push({ name: group, permissions: byName.get(group)! });
    }
    byName.get(group)![action as (typeof permissionColumns)[number]] = permission;
  }

  return groups;
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
        <div className="mt-3 text-base font-semibold">Delete {label || "role"}?</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          This will remove the role from the database and write a delete log.
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

function PermissionListView({
  permissionKeys,
  permissions,
}: {
  permissionKeys: string[];
  permissions: PermissionOption[];
}) {
  const selected = new Set(permissionKeys);
  const rows = groupPermissions(permissions)
    .map((group) => ({
      name: group.name,
      actions: permissionColumns
        .filter((column) => {
          const permission = group.permissions[column];
          return permission && selected.has(permission.key);
        })
        .map((column) => permissionColumnLabels[column]),
    }))
    .filter((row) => row.actions.length);

  if (!rows.length) {
    return <div className="text-sm text-muted-foreground">No permissions selected.</div>;
  }

  return (
    <div className="w-full rounded-md border bg-background text-left">
      {rows.map((row) => (
        <div key={row.name} className="grid grid-cols-[minmax(0,1fr)_auto] border-b last:border-b-0">
          <div className="min-w-0 px-3 py-2 text-sm font-medium">
            <span className="block truncate">{row.name}</span>
          </div>
          <div className="px-3 py-2 text-right text-xs text-muted-foreground">
            {row.actions.join(", ")}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleForm({
  value,
  onChange,
  permissions,
  errors = {},
}: {
  value: RoleEntity;
  onChange: (role: RoleEntity) => void;
  permissions: PermissionOption[];
  errors?: RoleValidationErrors;
}) {
  const permissionGroups = React.useMemo(() => groupPermissions(permissions), [permissions]);

  function setPermission(key: string, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...value.permissionKeys, key]))
      : value.permissionKeys.filter((permissionKey) => permissionKey !== key);
    onChange({ ...value, permissionKeys: next });
  }

  function setPermissionColumn(column: (typeof permissionColumns)[number], checked: boolean) {
    const columnKeys = permissionGroups
      .map((group) => group.permissions[column]?.key)
      .filter((key): key is string => Boolean(key));
    const next = checked
      ? Array.from(new Set([...value.permissionKeys, ...columnKeys]))
      : value.permissionKeys.filter((permissionKey) => !columnKeys.includes(permissionKey));
    onChange({ ...value, permissionKeys: next });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Role name" required error={errors.name}>
          <Input
            value={value.name}
            aria-invalid={Boolean(errors.name) || undefined}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
            placeholder="Role name"
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
        <div className="sm:col-span-2">
          <Field label="Description">
            <Input
              value={value.description ?? ""}
              onChange={(event) => onChange({ ...value, description: event.target.value })}
              placeholder="Optional"
            />
          </Field>
        </div>
      </div>

      <Field label="Permissions" required error={errors.permissionKeys}>
        <div
          className={cn(
            "max-h-[52vh] overflow-y-auto overflow-x-hidden rounded-md border bg-background shadow-xs",
            errors.permissionKeys && "border-destructive ring-[3px] ring-destructive/20",
          )}
        >
          <div className="w-full">
            <div className="sticky top-0 z-10 grid grid-cols-[minmax(120px,1fr)_repeat(4,minmax(42px,56px))] rounded-t-md border-b bg-background/95 text-[11px] font-medium text-muted-foreground shadow-[0_1px_0_0_var(--border)] backdrop-blur sm:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(72px,92px))] sm:text-xs">
              <div className="flex items-center px-3 py-2.5">Feature</div>
              {permissionColumns.map((column) => {
                const columnKeys = permissionGroups
                  .map((group) => group.permissions[column]?.key)
                  .filter((key): key is string => Boolean(key));
                const checkedCount = columnKeys.filter((key) => value.permissionKeys.includes(key)).length;
                const allChecked = columnKeys.length > 0 && checkedCount === columnKeys.length;
                const someChecked = checkedCount > 0 && !allChecked;

                return (
                  <label
                    key={column}
                    className="flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 border-l px-1.5 py-2 text-center transition-colors hover:bg-muted/40 sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5"
                    title={`Toggle all ${permissionColumnLabels[column]} permissions`}
                  >
                    <input
                      type="checkbox"
                      className="size-3.5 shrink-0 rounded border-border accent-primary"
                      checked={allChecked}
                      ref={(node) => {
                        if (node) node.indeterminate = someChecked;
                      }}
                      onChange={(event) => setPermissionColumn(column, event.target.checked)}
                    />
                    <span className="hidden sm:inline">{permissionColumnLabels[column]}</span>
                    <span className="sm:hidden">{permissionColumnLabels[column].slice(0, 1)}</span>
                  </label>
                );
              })}
            </div>

            {permissionGroups.map((group) => (
              <div
                key={group.name}
                className="grid grid-cols-[minmax(120px,1fr)_repeat(4,minmax(42px,56px))] border-b transition-colors last:border-b-0 hover:bg-muted/35 sm:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(72px,92px))]"
              >
                <div className="flex min-h-11 min-w-0 items-center px-3 text-sm font-medium">
                  <span className="truncate">{group.name}</span>
                </div>
                {permissionColumns.map((column) => {
                  const permission = group.permissions[column];
                  const checked = permission ? value.permissionKeys.includes(permission.key) : false;

                  return (
                    <div key={column} className="grid min-h-11 place-items-center border-l px-1.5 sm:px-3">
                      {permission ? (
                        <input
                          type="checkbox"
                          className="size-4 rounded border-border accent-primary"
                          checked={checked}
                          aria-label={`${group.name} ${permissionColumnLabels[column]}`}
                          title={permission.key}
                          onChange={(event) => setPermission(permission.key, event.target.checked)}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground/50">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Field>
    </div>
  );
}

export function RolesModule() {
  const { userId } = useUser();
  const [roles, setRoles] = React.useState<RoleEntity[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<RoleEntity | null>(null);
  const [editDraft, setEditDraft] = React.useState<RoleEntity | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<RoleEntity>(() => blankRole([]));
  const [createErrors, setCreateErrors] = React.useState<RoleValidationErrors>({});
  const [editErrors, setEditErrors] = React.useState<RoleValidationErrors>({});

  const loadRoles = React.useCallback(async () => {
    try {
      setLoading(true);
      const [nextRoles, lookups] = await Promise.all([listRoles(userId), listRoleLookups()]);
      setRoles(nextRoles);
      setPermissions(lookups.permissions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load roles");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  React.useEffect(() => {
    if (createOpen) {
      setDraft(blankRole(permissions.map((permission) => permission.key)));
      setCreateErrors({});
    }
  }, [createOpen, permissions]);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return roles
      .filter((role) => {
        if (!q) return true;
        const hay = `${role.name} ${role.description || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [roles, search]);

  const columns: Array<DataColumn<RoleEntity>> = [
    {
      id: "name",
      header: "Role",
      cell: (role) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{role.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {role.permissionKeys.length} permissions
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (role) => (
        <StatusBadge tone={role.status === 1 ? "compliant" : "neutral"}>
          {role.status === 1 ? "active" : "inactive"}
        </StatusBadge>
      ),
      className: "text-right",
    },
  ];

  function openDetails(role: RoleEntity) {
    setSelected(role);
    setEditDraft(null);
    setEditErrors({});
    setConfirmDelete(false);
  }

  async function saveEdit() {
    if (!selected || !editDraft) return;
    const errors = validateRole(editDraft, roles, selected.id);
    setEditErrors(errors);
    const message = firstError(errors);
    if (message) return toast.error(message);

    try {
      const updated = await updateRole(editDraft, userId);
      setRoles((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      setSelected(updated);
      setEditDraft(null);
      setEditErrors({});
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Role save failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadRoles()} disabled={loading}>
          <RefreshCw className="size-4" />
        </Button>
        <CreateActionDialog
          title="Create role"
          triggerLabel="Create"
          submitLabel="Create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          contentClassName="sm:max-w-4xl"
          onCreate={async () => {
            const errors = validateRole(draft, roles);
            setCreateErrors(errors);
            const message = firstError(errors);
            if (message) return toast.error(message), false;

            try {
              const created = await createRole(draft, userId);
              setRoles((rows) => [created, ...rows]);
              setCreateErrors({});
              toast.success("Role created");
              return true;
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Role create failed");
              return false;
            }
          }}
        >
          <RoleForm
            value={draft}
            onChange={(role) => {
              setDraft(role);
              if (Object.keys(createErrors).length) setCreateErrors({});
            }}
            permissions={permissions}
            errors={createErrors}
          />
        </CreateActionDialog>
      </div>

      <FilterBar
        left={
          <div className="w-full sm:w-[360px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search roles..." />
          </div>
        }
        onClear={() => setSearch("")}
      />

      <SectionCard title="Roles" description="Roles define permissions. Assign roles to users.">
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading roles from database...</div> : null}
        {!loading && rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No roles found.</div> : null}
        <DataTable rows={rows} columns={columns} rowKey={(row) => row.id} onRowClick={openDetails} />
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
        title={editDraft ? "Edit role" : "Role"}
        description={selected ? selected.name : undefined}
        overlay={
          selected && confirmDelete ? (
            <DrawerDeleteConfirm
              label={selected.name}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={async () => {
                await deleteRole(selected.id, userId);
                setRoles((rows) => rows.filter((role) => role.id !== selected.id));
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
              <RoleForm
                value={editDraft}
                onChange={(role) => {
                  setEditDraft(role);
                  if (Object.keys(editErrors).length) setEditErrors({});
                }}
                permissions={permissions}
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
                <DetailRow label="Description">{selected.description || "-"}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge tone={selected.status === 1 ? "compliant" : "neutral"}>
                    {selected.status === 1 ? "active" : "inactive"}
                  </StatusBadge>
                </DetailRow>
                <DetailRow label="Permissions">
                  <PermissionListView permissionKeys={selected.permissionKeys} permissions={permissions} />
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
