import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { permissionCatalog, seedRoles } from "@/data/admin";
import type { Role } from "@/types/admin";
import { useAdmin } from "@/app/state/admin";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { SectionCard } from "@/components/SectionCard";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { DetailPanel } from "@/components/DetailPanel";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { ActionModal } from "@/components/ActionModal";
import { StatusBadge } from "@/components/StatusBadge";
import { SelectFilter } from "@/components/SelectFilter";
import { cn } from "@/app/components/ui/utils";

function createId(prefix: string) {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

function isSystemRole(roleId: string) {
  return seedRoles.some((x) => x.id === roleId);
}

export function RolesModule() {
  const { roles, upsertRole, removeRole } = useAdmin();
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Role | null>(null);
  const [confirm, setConfirm] = React.useState<{ id: string; label: string } | null>(null);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return roles
      .filter((r) => {
        if (!q) return true;
        const hay = `${r.name} ${r.scope} ${r.description || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [roles, search]);

  const columns: Array<DataColumn<Role>> = [
    {
      id: "name",
      header: "Role",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{r.name}</div>
          <div className="text-muted-foreground mt-0.5 text-xs">
            {r.scope} • {r.permissionKeys.length} permissions
          </div>
        </div>
      ),
    },
    {
      id: "builtIn",
      header: "Built-in",
      cell: (r) => (
        <StatusBadge tone={isSystemRole(r.id) ? "info" : "neutral"}>
          {isSystemRole(r.id) ? "system" : "custom"}
        </StatusBadge>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <CreateActionDialog
          title="Create role"
          triggerLabel="Create"
          submitLabel="Create"
          contentClassName="sm:max-w-2xl"
          onCreate={() => {
            const id = createId("role");
            const role: Role = {
              id,
              name: "",
              scope: "factory",
              description: "",
              permissionKeys: ["dashboard:view"],
            };
            upsertRole(role);
            setSelected(role);
          }}
        >
          <div className="rounded-xl border bg-muted/10 p-3 text-sm">
            Create opens the right panel to complete details.
          </div>
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
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} onRowClick={setSelected} />
      </SectionCard>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(o) => (!o ? setSelected(null) : null)}
        title="Role"
        description={selected ? selected.scope : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Name</div>
                <Input
                  value={selected.name}
                  onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                  placeholder="Role name"
                  disabled={isSystemRole(selected.id)}
                />
                {isSystemRole(selected.id) ? (
                  <div className="text-muted-foreground text-xs">
                    System roles are read-only. Create a custom role to edit.
                  </div>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Scope</div>
                <SelectFilter
                  value={selected.scope}
                  onChange={(v) => setSelected({ ...selected, scope: (v as any) || selected.scope })}
                  placeholder="Scope"
                  items={[
                    { value: "group", label: "Group" },
                    { value: "factory", label: "Factory" },
                  ]}
                  disabled={isSystemRole(selected.id)}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Permissions</div>
                <div className="grid gap-2 rounded-xl border p-3">
                  {permissionCatalog.map((p) => {
                    const checked = selected.permissionKeys.includes(p.key);
                    return (
                      <label
                        key={p.key}
                        className={cn(
                          "flex cursor-pointer items-start gap-3",
                          isSystemRole(selected.id) && "opacity-70",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={checked}
                          disabled={isSystemRole(selected.id)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? Array.from(new Set([...selected.permissionKeys, p.key]))
                              : selected.permissionKeys.filter((x) => x !== p.key);
                            setSelected({ ...selected, permissionKeys: next });
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{p.label}</div>
                          <div className="text-muted-foreground mt-0.5 text-xs">{p.key}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="destructive"
                disabled={isSystemRole(selected.id)}
                onClick={() => setConfirm({ id: selected.id, label: selected.name || "Role" })}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
              <Button
                onClick={() => {
                  if (!selected.name.trim()) return toast.error("Role name is required");
                  if (!selected.permissionKeys.length) return toast.error("Select at least one permission");
                  upsertRole(selected);
                  toast.success("Saved");
                }}
                disabled={isSystemRole(selected.id)}
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
        title={`Delete ${confirm?.label || "role"}?`}
        description="This will remove the role from the local settings store."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!confirm) return;
          removeRole(confirm.id);
          setSelected(null);
          setConfirm(null);
          toast.success("Deleted");
        }}
      />
    </div>
  );
}

