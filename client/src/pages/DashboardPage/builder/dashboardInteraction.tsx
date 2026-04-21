import * as React from "react";

type DashboardInteractionContextValue = {
  isInteracting: boolean;
  start: () => void;
  end: () => void;
};

const DashboardInteractionContext =
  React.createContext<DashboardInteractionContextValue | null>(null);

export function DashboardInteractionProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = React.useState(0);

  const start = React.useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const end = React.useCallback(() => {
    setCount((c) => Math.max(0, c - 1));
  }, []);

  const value = React.useMemo(
    () => ({ isInteracting: count > 0, start, end }),
    [count, start, end],
  );

  return (
    <DashboardInteractionContext.Provider value={value}>
      {children}
    </DashboardInteractionContext.Provider>
  );
}

export function useDashboardInteraction() {
  const ctx = React.useContext(DashboardInteractionContext);
  if (!ctx) {
    throw new Error("useDashboardInteraction must be used within DashboardInteractionProvider");
  }
  return ctx;
}

