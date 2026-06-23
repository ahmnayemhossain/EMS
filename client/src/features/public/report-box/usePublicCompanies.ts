import * as React from "react";

import type { CompanyOption } from "@/core/app/state/slices/company";
import { fetchCompanies } from "@/core/app/state/slices/company.api";

export function usePublicCompanies() {
  const [companies, setCompanies] = React.useState<CompanyOption[]>([]);

  React.useEffect(() => {
    let active = true;

    void fetchCompanies()
      .then((nextCompanies) => {
        if (active) setCompanies(nextCompanies);
      })
      .catch(() => {
        if (active) setCompanies([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return companies;
}
