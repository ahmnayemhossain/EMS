import * as React from "react";

import { useAuthStore } from "@/core/app/state/slices/auth";
import { useCompanyStore } from "@/core/app/state/slices/company.store";

export function CompanySync() {
  const token = useAuthStore((state) => state.token);
  const loadCompanies = useCompanyStore((state) => state.loadCompanies);

  React.useEffect(() => {
    void loadCompanies(token);
  }, [loadCompanies, token]);

  return null;
}
