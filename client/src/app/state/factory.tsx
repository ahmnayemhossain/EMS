import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

import { createSafeJsonStorage } from "@/app/state/_shared/zustand-storage";
import { facilities } from "@/data/mock";

type FactoryStore = {
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
};

const STORAGE_KEY = "ems:selectedFactoryId";

function getDefaultFactoryId() {
  return facilities[0]?.id ?? "unknown";
}

const useFactoryStore = create<FactoryStore>()(
  persist(
    (set) => ({
      selectedFactoryId: getDefaultFactoryId(),
      setSelectedFactoryId: (id: string) => set({ selectedFactoryId: id }),
    }),
    {
      name: STORAGE_KEY,
      storage: createSafeJsonStorage<FactoryStore>(),
      partialize: (state) => ({ selectedFactoryId: state.selectedFactoryId }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<FactoryStore>) };
        return {
          ...merged,
          selectedFactoryId: merged.selectedFactoryId || getDefaultFactoryId(),
        };
      },
    },
  ),
);

export function useSelectedFactory() {
  return useFactoryStore(
    (s) => ({
      selectedFactoryId: s.selectedFactoryId,
      setSelectedFactoryId: s.setSelectedFactoryId,
    }),
    shallow,
  );
}
