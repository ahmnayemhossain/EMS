import * as React from "react";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { blankRole } from "@/features/admin/settings/modules/roles/helpers";
import { listRoleLookups, listRoles, type PermissionOption, type RoleEntity } from "@/features/admin/settings/modules/settingsEntityApi";

export function useRolesModule() {
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
  const [createErrors, setCreateErrors] = React.useState({});
  const [editErrors, setEditErrors] = React.useState({});

  const loadRoles = React.useCallback(async () => {
    try { setLoading(true); const [nextRoles, lookups] = await Promise.all([listRoles(userId), listRoleLookups()]); setRoles(nextRoles); setPermissions(lookups.permissions); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load roles"); } finally { setLoading(false); }
  }, [userId]);

  React.useEffect(() => { void loadRoles(); }, [loadRoles]);
  React.useEffect(() => { if (createOpen) { setDraft(blankRole(permissions.map((permission) => permission.key))); setCreateErrors({}); } }, [createOpen, permissions]);

  const rows = React.useMemo(() => roles.filter((role) => !search.trim() || `${role.name} ${role.description || ""}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => (a.name > b.name ? 1 : -1)), [roles, search]);
  return { userId, roles, permissions, loading, search, selected, editDraft, confirmDelete, createOpen, draft, createErrors, editErrors, rows, setRoles, setSearch, setSelected, setEditDraft, setConfirmDelete, setCreateOpen, setDraft, setCreateErrors, setEditErrors, loadRoles };
}
