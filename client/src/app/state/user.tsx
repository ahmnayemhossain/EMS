import { defaultUserId, emsUsers } from "@/data/users";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

import { createSafeJsonStorage } from "@/app/state/_shared/zustand-storage";

type UserContextValue = {
  userId: string;
  setUserId: (id: string) => void;
};

const STORAGE_KEY = "ems:user_v1";

type UserStore = UserContextValue;

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: defaultUserId,
      setUserId: (id: string) => {
        const ok = emsUsers.some((u) => u.id === id);
        set({ userId: ok ? id : defaultUserId });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createSafeJsonStorage<UserStore>(),
      partialize: (state) => ({ userId: state.userId }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<UserStore>) };
        const ok = emsUsers.some((u) => u.id === merged.userId);
        return { ...merged, userId: ok ? merged.userId : defaultUserId };
      },
    },
  ),
);

export function useUser(): UserContextValue {
  return useUserStore(
    (s) => ({ userId: s.userId, setUserId: s.setUserId }),
    shallow,
  );
}

export function useCurrentUser() {
  const { userId } = useUser();
  return emsUsers.find((u) => u.id === userId) ?? emsUsers[0];
}
