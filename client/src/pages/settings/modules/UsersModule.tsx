import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { facilities, getFacilityName } from "@/data/mock";
import type { AppUser } from "@/types/admin";
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

function createId(prefix: string) {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

export function UsersModule() {
  const { employees, users, roles, upsertUser, removeUser } = useAdmin();
  const [search, setSearch] = React.useState("");
  const [factoryId, setFactoryId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<AppUser | null>(null);
  const [confirm, setConfirm] = React.useState<{ id: string; label: string } | null>(null);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => {
        const emp = employees.find((e) => e.employeeId === u.employeeId);
        return factoryId ? emp?.factoryId === factoryId : true;
      })
      .filter((u) => {
        if (!q) return true;
        const emp = employees.find((e) => e.employeeId === u.employeeId);
        const hay = `${u.username} ${u.email} ${u.employeeId} ${emp?.name || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.username > b.username ? 1 : -1));
  }, [users, employees, search, factoryId]);

  const columns: Array<DataColumn<AppUser>> = [
    {
      id: "user",
      header: "User",
      cell: (u) => {
        const emp = employees.find((e) => e.employeeId === u.employeeId);
        return (
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {emp?.name || "Unknown"}{" "}
              <span className="text-muted-foreground font-normal">({u.username})</span>
            </div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              {u.email} • ID {u.employeeId}
            </div>
          </div>
        );
      },
    },
    {
      id: "roles",
      header: "Roles",
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roleIds.slice(0, 2).map((id) => (
            <StatusBadge key={id} tone="neutral">
              {roles.find((r) => r.id === id)?.name || "Role"}
            </StatusBadge>
          ))}
          {u.roleIds.length > 2 ? (
            <StatusBadge tone="neutral">+{u.roleIds.length - 2}</StatusBadge>
          ) : null}
        </div>
      ),
      className: "hidden lg:table-cell",
    },
    {
      id: "status",
      header: "Status",
      cell: (u) => (
        <StatusBadge tone={u.status === "active" ? "compliant" : "warning"}>
          {u.status}
        </StatusBadge>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <CreateActionDialog
          title="Create user"
          triggerLabel="Create"
          submitLabel="Create"
          contentClassName="sm:max-w-2xl"
          onCreate={() => {
            const id = createId("usr");
            const user: AppUser = {
              id,
              employeeId: employees[0]?.employeeId ?? "700901",
              username: "",
              email: "",
              roleIds: ["role_viewer"],
              status: "active",
            };
            upsertUser(user);
            setSelected(user);
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
              <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
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

      <SectionCard title="Users" description="Application accounts and access status.">
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} onRowClick={setSelected} />
      </SectionCard>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(o) => (!o ? setSelected(null) : null)}
        title="User"
        description={selected ? `${selected.username || "New user"}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Employee</div>
                <SelectFilter
                  value={selected.employeeId}
                  onChange={(v) => setSelected({ ...selected, employeeId: v || selected.employeeId })}
                  placeholder="Pick employee"
                  items={employees.map((e) => ({
                    value: e.employeeId,
                    label: `${e.name} (${e.employeeId}) • ${getFacilityName(e.factoryId)}`,
                  }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Username</div>
                <Input
                  value={selected.username}
                  onChange={(e) => setSelected({ ...selected, username: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Email</div>
                <Input
                  value={selected.email}
                  onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                  placeholder="user@fortis.local"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Roles</div>
                <div className="grid gap-2 rounded-xl border p-3">
                  {roles.map((r) => {
                    const checked = selected.roleIds.includes(r.id);
                    return (
                      <label key={r.id} className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? Array.from(new Set([...selected.roleIds, r.id]))
                              : selected.roleIds.filter((x) => x !== r.id);
                            setSelected({ ...selected, roleIds: next });
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{r.name}</div>
                          {r.description ? (
                            <div className="text-muted-foreground mt-0.5 text-xs">{r.description}</div>
                          ) : null}
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
                onClick={() => setConfirm({ id: selected.id, label: selected.username || "User" })}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
              <Button
                onClick={() => {
                  if (!selected.username.trim()) return toast.error("Username is required");
                  if (!selected.email.trim()) return toast.error("Email is required");
                  if (!selected.roleIds.length) return toast.error("At least one role is required");
                  upsertUser(selected);
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
        title={`Delete ${confirm?.label || "user"}?`}
        description="This will remove the user from the local settings store."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!confirm) return;
          removeUser(confirm.id);
          setSelected(null);
          setConfirm(null);
          toast.success("Deleted");
        }}
      />
    </div>
  );
}

