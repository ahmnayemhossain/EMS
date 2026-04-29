import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createSafeJsonStorage } from "@/app/state/_shared/zustand-storage";
import { PERMISSION_STORAGE_KEY, toServerUserId } from "@/app/state/permissions.helpers";

export type PermissionState = {
  userId: string | null;
  permissionKeys: string[];
  loading: boolean;
  error: string | null;
  load: (userId: string, token?: string | null) => Promise<void>;
  clear: () => void;
};

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      userId: null,
      permissionKeys: [],
      loading: false,
      error: null,
      load: async (userId, token) => {
        set({ userId, loading: true, error: null });
        try {
          const response = await fetch("/api/system/me", {
            cache: "no-store",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              "x-user-id": toServerUserId(userId),
            },
          });
          const data = await response.json().catch(() => null);
          if (!response.ok) throw new Error(data?.error || "Could not load permissions.");
          const permissionKeys = Array.isArray(data?.permissionKeys) ? data.permissionKeys.map(String) : [];
          set({ userId, permissionKeys, loading: false, error: null });
        } catch (error) {
          set((state) => ({
            userId,
            permissionKeys: state.userId === userId ? state.permissionKeys : [],
            loading: false,
            error: error instanceof Error ? error.message : "Could not load permissions.",
          }));
        }
      },
      clear: () => set({ userId: null, permissionKeys: [], loading: false, error: null }),
    }),
    {
      name: PERMISSION_STORAGE_KEY,
      storage: createSafeJsonStorage<PermissionState>(),
      partialize: (state) => ({ userId: state.userId, permissionKeys: state.permissionKeys }) as PermissionState,
    },
  ),
);
