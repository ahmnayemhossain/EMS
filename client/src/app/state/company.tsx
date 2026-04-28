import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

import { createSafeJsonStorage } from "@/app/state/_shared/zustand-storage";
import { useAuthStore } from "@/app/state/auth";

export type CompanyOption = {
  id: string;
  name: string;
  shortName?: string;
  localName?: string;
  address?: string;
};

type CompanyStore = {
  selectedCompanyId: string;
  companies: CompanyOption[];
  loading: boolean;
  error: string | null;
  setSelectedCompanyId: (id: string) => void;
  loadCompanies: (token?: string | null) => Promise<void>;
};

const STORAGE_KEY = "ems:selectedCompanyId";

function authHeaders(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      selectedCompanyId: "",
      companies: [],
      loading: false,
      error: null,
      setSelectedCompanyId: (id: string) => set({ selectedCompanyId: id }),
      loadCompanies: async (token) => {
        if (!token) {
          set({ companies: [], selectedCompanyId: "", loading: false, error: null });
          return;
        }

        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/system/companies/options", {
            cache: "no-store",
            headers: authHeaders(token),
          });
          const data = await response.json().catch(() => null);
          if (!response.ok) throw new Error(data?.error || "Could not load companies.");

          const companies = Array.isArray(data)
            ? data.map((company) => ({
                id: String(company.id),
                name: String(company.name || "Company"),
                shortName: company.shortName ? String(company.shortName) : undefined,
                localName: company.localName ? String(company.localName) : undefined,
                address: company.address ? String(company.address) : undefined,
              }))
            : [];
          const currentId = get().selectedCompanyId;
          const nextSelectedCompanyId = companies.some((company) => company.id === currentId)
            ? currentId
            : companies[0]?.id || "";

          set({
            companies,
            selectedCompanyId: nextSelectedCompanyId,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : "Could not load companies.",
          });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createSafeJsonStorage<CompanyStore>(),
      partialize: (state) => ({ selectedCompanyId: state.selectedCompanyId }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<CompanyStore>) };
        return {
          ...merged,
          selectedCompanyId: merged.selectedCompanyId || "",
        };
      },
    },
  ),
);

export function useSelectedCompany() {
  return useCompanyStore(
    (s) => ({
      selectedCompanyId: s.selectedCompanyId,
      companies: s.companies,
      loading: s.loading,
      error: s.error,
      setSelectedCompanyId: s.setSelectedCompanyId,
      loadCompanies: s.loadCompanies,
    }),
    shallow,
  );
}

export function CompanySync() {
  const token = useAuthStore((state) => state.token);
  const loadCompanies = useCompanyStore((state) => state.loadCompanies);

  React.useEffect(() => {
    void loadCompanies(token);
  }, [loadCompanies, token]);

  return null;
}
