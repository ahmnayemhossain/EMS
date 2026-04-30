import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createSafeJsonStorage } from "@/core/app/state/_shared/zustand-storage";
import { fetchCompanies } from "@/core/app/state/company.api";
import type { CompanyOption, CompanyStore } from "@/core/app/state/company";

const STORAGE_KEY = "ems:selectedCompanyId";

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      selectedCompanyId: "",
      companies: [],
      loading: false,
      error: null,
      setSelectedCompanyId: (id: string) => set({ selectedCompanyId: id }),
      loadCompanies: async (token) => {
        if (!token) return set({ companies: [], selectedCompanyId: "", loading: false, error: null });
        set({ loading: true, error: null });
        try {
          const companies = await fetchCompanies(token);
          const currentId = get().selectedCompanyId;
          const selectedCompanyId = companies.some((company) => company.id === currentId) ? currentId : companies[0]?.id || "";
          set({ companies, selectedCompanyId, loading: false, error: null });
        } catch (error) {
          set({ loading: false, error: error instanceof Error ? error.message : "Could not load companies." });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createSafeJsonStorage<CompanyStore>(),
      partialize: (state) => ({ selectedCompanyId: state.selectedCompanyId } as Pick<CompanyStore, "selectedCompanyId">),
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<CompanyStore>), selectedCompanyId: (persisted as Partial<CompanyStore>)?.selectedCompanyId || "" }),
    },
  ),
);
