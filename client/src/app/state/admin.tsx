import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

import { createSafeJsonStorage } from "@/app/state/_shared/zustand-storage";
import { seedEmployees, seedRoles, seedUsers } from "@/data/admin";
import type { AppUser, Employee, Role } from "@/types/admin";

type AdminStore = {
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

const STORAGE_KEY = "ems:admin_v1";

type AdminDoc = {
  employees: Employee[];
  users: AppUser[];
  roles: Role[];
};

function safeDoc(value: unknown): AdminDoc | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<AdminDoc>;
  if (!Array.isArray(v.employees)) return null;
  if (!Array.isArray(v.users)) return null;
  if (!Array.isArray(v.roles)) return null;
  return { employees: v.employees, users: v.users, roles: v.roles } as AdminDoc;
}

function upsertById<T extends { id: string }>(rows: T[], next: T) {
  return rows.some((r) => r.id === next.id)
    ? rows.map((r) => (r.id === next.id ? next : r))
    : [next, ...rows];
}

const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      employees: seedEmployees,
      users: seedUsers,
      roles: seedRoles,
      upsertEmployee: (emp) =>
        set((s) => ({ employees: upsertById(s.employees, emp) })),
      removeEmployee: (id) =>
        set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),
      upsertUser: (user) => set((s) => ({ users: upsertById(s.users, user) })),
      removeUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      upsertRole: (role) => set((s) => ({ roles: upsertById(s.roles, role) })),
      removeRole: (id) => set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),
    }),
    {
      name: STORAGE_KEY,
      storage: createSafeJsonStorage<AdminStore>(),
      partialize: (s) => ({ employees: s.employees, users: s.users, roles: s.roles }),
      merge: (persisted, current) => {
        const doc = safeDoc((persisted as any)?.state);
        return doc ? { ...current, ...doc } : current;
      },
    },
  ),
);

export function useAdmin() {
  return useAdminStore(
    (s) => ({
      employees: s.employees,
      users: s.users,
      roles: s.roles,
      upsertEmployee: s.upsertEmployee,
      removeEmployee: s.removeEmployee,
      upsertUser: s.upsertUser,
      removeUser: s.removeUser,
      upsertRole: s.upsertRole,
      removeRole: s.removeRole,
    }),
    shallow,
  );
}

