import * as React from "react";
import { useTheme } from "next-themes";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

import { createSafeJsonStorage } from "@/core/app/state/_shared/zustand-storage";

export type ThemeMode = "auto" | "system" | "light" | "dark";

type ThemeModeStore = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "ems-theme-mode";

export function getAutoTheme(now: Date = new Date()): "light" | "dark" {
  // "Day" = 07:00–16:59, "Evening/Night" = 17:00–06:59
  const hour = now.getHours();
  return hour >= 17 || hour < 7 ? "dark" : "light";
}

function isThemeMode(value: unknown): value is ThemeMode {
  return (
    value === "auto" || value === "system" || value === "light" || value === "dark"
  );
}

const useThemeModeStore = create<ThemeModeStore>()(
  persist(
    (set) => ({
      mode: "auto",
      setMode: (mode: ThemeMode) => set({ mode }),
    }),
    {
      name: STORAGE_KEY,
      storage: createSafeJsonStorage<ThemeModeStore>(),
      partialize: (state) => ({ mode: state.mode }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<ThemeModeStore>) };
        return { ...merged, mode: isThemeMode(merged.mode) ? merged.mode : "auto" };
      },
    },
  ),
);

export function useThemeMode() {
  return useThemeModeStore(
    (s) => ({ mode: s.mode, setMode: s.setMode }),
    shallow,
  );
}

export function ThemeModeSync() {
  const { setTheme } = useTheme();
  const { mode } = useThemeMode();

  React.useEffect(() => {
    if (mode === "system") {
      setTheme("system");
      return;
    }
    if (mode === "light") {
      setTheme("light");
      return;
    }
    if (mode === "dark") {
      setTheme("dark");
      return;
    }

    const applyAuto = () => setTheme(getAutoTheme());
    applyAuto();

    const id = window.setInterval(applyAuto, 60_000);
    return () => window.clearInterval(id);
  }, [mode, setTheme]);

  return null;
}
