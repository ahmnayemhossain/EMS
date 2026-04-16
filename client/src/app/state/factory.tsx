import * as React from "react";

import { facilities } from "@/data/mock";

type FactoryContextValue = {
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
};

const FactoryContext = React.createContext<FactoryContextValue | null>(null);

const STORAGE_KEY = "ems:selectedFactoryId";

function getDefaultFactoryId() {
  return facilities[0]?.id ?? "unknown";
}

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedFactoryId, setSelectedFactoryIdState] = React.useState(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    return saved || getDefaultFactoryId();
  });

  const setSelectedFactoryId = React.useCallback((id: string) => {
    setSelectedFactoryIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo(
    () => ({ selectedFactoryId, setSelectedFactoryId }),
    [selectedFactoryId, setSelectedFactoryId],
  );

  return (
    <FactoryContext.Provider value={value}>{children}</FactoryContext.Provider>
  );
}

export function useSelectedFactory() {
  const ctx = React.useContext(FactoryContext);
  if (!ctx) {
    throw new Error("useSelectedFactory must be used within <FactoryProvider />");
  }
  return ctx;
}

