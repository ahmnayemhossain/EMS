import * as React from "react";
import { shallow } from "zustand/shallow";

import { CompanySync } from "@/core/app/state/company.sync";
import { useCompanyStore } from "@/core/app/state/company.store";

export type CompanyOption = {
  id: string;
  name: string;
  shortName?: string;
  localName?: string;
  address?: string;
};

export type CompanyStore = {
  selectedCompanyId: string;
  companies: CompanyOption[];
  loading: boolean;
  error: string | null;
  setSelectedCompanyId: (id: string) => void;
  loadCompanies: (token?: string | null) => Promise<void>;
};

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
export { CompanySync };
