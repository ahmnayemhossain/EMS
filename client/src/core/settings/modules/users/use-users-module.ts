import * as React from "react";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/user";
import { createUser, deleteUser, listUserLookups, listUsers, resetUserPassword, updateUser, type UserInput } from "@/core/settings/modules/usersApi";
import { blankUser, firstError, validateUser } from "@/core/settings/modules/users/form-helpers";

export function useUsersModule() {
  const { userId } = useUser();
  const [state, setState] = React.useState({ users: [], employees: [], roles: [], companies: [], loading: true });
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<UserInput | null>(null);
  const [draft, setDraft] = React.useState<UserInput>(() => blankUser([]));
  const [editDraft, setEditDraft] = React.useState<UserInput | null>(null);
  const [createErrors, setCreateErrors] = React.useState({});
  const [editErrors, setEditErrors] = React.useState({});
  const [createOpen, setCreateOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const loadUsers = React.useCallback(async () => {
    try {
      setState((current) => ({ ...current, loading: true }));
      const [users, lookups] = await Promise.all([listUsers(userId), listUserLookups()]);
      setState({ users, employees: lookups.employees, roles: lookups.roles, companies: lookups.facilities, loading: false });
    } catch (error) {
      setState((current) => ({ ...current, loading: false }));
      toast.error(error instanceof Error ? error.message : "Could not load users");
    }
  }, [userId]);

  React.useEffect(() => { void loadUsers(); }, [loadUsers]);
  React.useEffect(() => { if (createOpen) { setDraft(blankUser(state.roles.map((role) => role.id))); setCreateErrors({}); } }, [createOpen, state.roles]);

  const rows = React.useMemo(() => state.users.filter((user) => !companyId || user.companyAccessIds?.includes(companyId) || user.companyId === companyId).filter((user) => !search.trim() || `${user.username} ${user.email} ${user.employeeId} ${user.employeeName || ""}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => (a.username > b.username ? 1 : -1)), [companyId, search, state.users]);

  async function submitCreate() {
    const errors = validateUser(draft, state.users);
    setCreateErrors(errors);
    const message = firstError(errors);
    if (message) return toast.error(message), false;
    try { const created = await createUser(draft, userId); setState((current) => ({ ...current, users: [created, ...current.users] })); setCreateErrors({}); toast.success("User created"); return true; } catch (error) { toast.error(error instanceof Error ? error.message : "User create failed"); return false; }
  }

  return { userId, state, search, companyId, selected, draft, editDraft, createErrors, editErrors, createOpen, confirmDelete, rows, setSearch, setCompanyId, setSelected, setDraft, setEditDraft, setCreateErrors, setEditErrors, setCreateOpen, setConfirmDelete, loadUsers, submitCreate };
}
