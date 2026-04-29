import * as React from "react";

import { useAuthStore } from "@/app/state/auth";
import { useCompanyStore } from "@/app/state/company.store";

export function CompanySync() {
  const token = useAuthStore((state) => state.token);
  const loadCompanies = useCompanyStore((state) => state.loadCompanies);

  React.useEffect(() => {
    void loadCompanies(token);
  }, [loadCompanies, token]);

  return null;
}
