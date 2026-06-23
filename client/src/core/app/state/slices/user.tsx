import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

import { createSafeJsonStorage } from "@/core/app/state/_shared/zustand-storage";
import { useAuthStore } from "@/core/app/state/slices/auth";

type UserContextValue = {
  userId: string;
  setUserId: (id: string) => void;
};

const STORAGE_KEY = "ems:user_v1";

type UserStore = UserContextValue;

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: "",
      setUserId: (id: string) => {
        set({ userId: String(id || "").trim() });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createSafeJsonStorage<UserStore>(),
      partialize: (state) => ({ userId: state.userId }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<UserStore>) };
        return { ...merged, userId: String(merged.userId || "").trim() };
      },
    },
  ),
);

export function useUser(): UserContextValue {
  const stored = useUserStore(
    (s) => ({ userId: s.userId, setUserId: s.setUserId }),
    shallow,
  );
  const authUser = useAuthStore((s) => s.user);

  return authUser ? { ...stored, userId: authUser.id } : stored;
}

export function useCurrentUser() {
  const authUser = useAuthStore((s) => s.user);
  if (authUser) {
    return {
      id: authUser.id,
      name: authUser.name,
      employeeId: authUser.employeeId ? `EMP-${String(authUser.employeeId).padStart(4, "0")}` : authUser.username,
    };
  }

  const { userId } = useUser();
  return {
    id: userId || "current-user",
    name: "Current user",
    employeeId: userId || "-",
  };
}
