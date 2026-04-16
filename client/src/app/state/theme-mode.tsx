import * as React from "react";
import { useTheme } from "next-themes";

type ThemeMode = "auto" | "system" | "light" | "dark";

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = React.createContext<ThemeModeContextValue | null>(null);

const STORAGE_KEY = "ems-theme-mode";

export function getAutoTheme(now: Date = new Date()): "light" | "dark" {
  // "Day" = 07:00–16:59, "Evening/Night" = 17:00–06:59
  const hour = now.getHours();
  return hour >= 17 || hour < 7 ? "dark" : "light";
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "auto" || v === "system" || v === "light" || v === "dark") return v;
  return "auto";
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const [mode, setModeState] = React.useState<ThemeMode>(() => readStoredMode());

  const setMode = React.useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    // Ensure first-time visitors default to auto.
    if (typeof window !== "undefined" && !window.localStorage.getItem(STORAGE_KEY)) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "auto");
      } catch {
        // ignore
      }
    }
  }, []);

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

    // Auto: time-based (day = light, evening/night = dark)
    const applyAuto = () => setTheme(getAutoTheme());
    applyAuto();

    // Update periodically so theme flips when time crosses the boundary.
    const id = window.setInterval(applyAuto, 60_000);
    return () => window.clearInterval(id);
  }, [mode, setTheme]);

  const value = React.useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = React.useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return ctx;
}
