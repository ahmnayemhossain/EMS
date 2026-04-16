import * as React from "react";

import type { AppUser, Employee, Role } from "@/types/admin";
import { seedEmployees, seedRoles, seedUsers } from "@/data/admin";

type AdminContextValue = {
  employees: Employee[];
  users: AppUser[];
  roles: Role[];
  upsertEmployee: (emp: Employee) => void;
  removeEmployee: (id: string) => void;
  upsertUser: (user: AppUser) => void;
  removeUser: (id: string) => void;
  upsertRole: (role: Role) => void;
  removeRole: (id: string) => void;
};

const AdminContext = React.createContext<AdminContextValue | null>(null);

const STORAGE_KEY = "ems:admin_v1";

type AdminDoc = {
  employees: Employee[];
  users: AppUser[];
  roles: Role[];
};

function safeParse(raw: string | null): AdminDoc | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as any;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.employees)) return null;
    if (!Array.isArray(parsed.users)) return null;
    if (!Array.isArray(parsed.roles)) return null;
    return parsed as AdminDoc;
  } catch {
    return null;
  }
}

function uniqById<T extends { id: string }>(rows: T[]) {
  const map = new Map<string, T>();
  for (const r of rows) map.set(r.id, r);
  return Array.from(map.values());
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = React.useState<Employee[]>(() => {
    if (typeof window === "undefined") return seedEmployees;
    const saved = safeParse(window.localStorage.getItem(STORAGE_KEY));
    return saved?.employees?.length ? saved.employees : seedEmployees;
  });
  const [users, setUsers] = React.useState<AppUser[]>(() => {
    if (typeof window === "undefined") return seedUsers;
    const saved = safeParse(window.localStorage.getItem(STORAGE_KEY));
    return saved?.users?.length ? saved.users : seedUsers;
  });
  const [roles, setRoles] = React.useState<Role[]>(() => {
    if (typeof window === "undefined") return seedRoles;
    const saved = safeParse(window.localStorage.getItem(STORAGE_KEY));
    return saved?.roles?.length ? saved.roles : seedRoles;
  });

  React.useEffect(() => {
    try {
      const doc: AdminDoc = {
        employees: uniqById(employees),
        users: uniqById(users),
        roles: uniqById(roles),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // ignore
    }
  }, [employees, users, roles]);

  const upsertEmployee = React.useCallback((emp: Employee) => {
    setEmployees((prev) => {
      const next = prev.some((e) => e.id === emp.id)
        ? prev.map((e) => (e.id === emp.id ? emp : e))
        : [emp, ...prev];
      return next;
    });
  }, []);

  const removeEmployee = React.useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const upsertUser = React.useCallback((user: AppUser) => {
    setUsers((prev) => {
      const next = prev.some((u) => u.id === user.id)
        ? prev.map((u) => (u.id === user.id ? user : u))
        : [user, ...prev];
      return next;
    });
  }, []);

  const removeUser = React.useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const upsertRole = React.useCallback((role: Role) => {
    setRoles((prev) => {
      const next = prev.some((r) => r.id === role.id)
        ? prev.map((r) => (r.id === role.id ? role : r))
        : [role, ...prev];
      return next;
    });
  }, []);

  const removeRole = React.useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = React.useMemo<AdminContextValue>(
    () => ({
      employees,
      users,
      roles,
      upsertEmployee,
      removeEmployee,
      upsertUser,
      removeUser,
      upsertRole,
      removeRole,
    }),
    [
      employees,
      users,
      roles,
      upsertEmployee,
      removeEmployee,
      upsertUser,
      removeUser,
      upsertRole,
      removeRole,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = React.useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within <AdminProvider />");
  return ctx;
}

