import * as React from "react";

import { defaultUserId, emsUsers } from "@/data/users";

type UserContextValue = {
  userId: string;
  setUserId: (id: string) => void;
};

const UserContext = React.createContext<UserContextValue | null>(null);

const STORAGE_KEY = "ems:user_v1";

function safeInitialUserId() {
  if (typeof window === "undefined") return defaultUserId;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  const ok = saved && emsUsers.some((u) => u.id === saved);
  return ok ? (saved as string) : defaultUserId;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = React.useState<string>(() => safeInitialUserId());

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, userId);
    } catch {
      // ignore
    }
  }, [userId]);

  const value = React.useMemo(() => ({ userId, setUserId }), [userId]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider />");
  return ctx;
}

export function useCurrentUser() {
  const { userId } = useUser();
  return emsUsers.find((u) => u.id === userId) ?? emsUsers[0];
}

