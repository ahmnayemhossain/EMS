import * as React from "react";
import { create } from "zustand";
import { shallow } from "zustand/shallow";

import { useAuthStore } from "@/app/state/auth";
import { useUser } from "@/app/state/user";

type PermissionState = {
  userId: string | null;
  permissionKeys: string[];
  loading: boolean;
  error: string | null;
  load: (userId: string, token?: string | null) => Promise<void>;
  clear: () => void;
};

function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}

const usePermissionStore = create<PermissionState>()((set, get) => ({
  userId: null,
  permissionKeys: [],
  loading: false,
  error: null,
  load: async (userId, token) => {
    if (get().userId === userId && get().permissionKeys.length) return;

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

      set({
        userId,
        permissionKeys: Array.isArray(data?.permissionKeys) ? data.permissionKeys.map(String) : [],
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        userId,
        permissionKeys: [],
        loading: false,
        error: error instanceof Error ? error.message : "Could not load permissions.",
      });
    }
  },
  clear: () => set({ userId: null, permissionKeys: [], loading: false, error: null }),
}));

export function PermissionSync() {
  const { userId } = useUser();
  const authUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const load = usePermissionStore((state) => state.load);
  const clear = usePermissionStore((state) => state.clear);

  React.useEffect(() => {
    if (!authUser) {
      clear();
      return;
    }

    void load(authUser.id || userId, token);
  }, [authUser, clear, load, token, userId]);

  return null;
}

export function usePermissions() {
  return usePermissionStore(
    (state) => ({
      permissionKeys: state.permissionKeys,
      loading: state.loading,
      error: state.error,
    }),
    shallow,
  );
}

export function useCan(permission?: string) {
  const { permissionKeys, loading } = usePermissions();
  if (!permission) return true;
  if (loading) return true;
  if (permission.startsWith("settings:") && permissionKeys.includes("settings:manage")) return true;
  return permissionKeys.includes(permission);
}
