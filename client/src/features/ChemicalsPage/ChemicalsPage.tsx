import * as React from "react";

import { PageHeader } from "@/core/components/PageHeader";
import { facilities } from "@/core/data/mock";
import type { Chemical } from "@/core/types/ems";

import { ChemicalsContent } from "./ChemicalsContent";
import { ChemicalCreateDialog } from "./components/ChemicalCreateDialog";
import { ChemicalFiltersBar } from "./components/ChemicalFiltersBar";
import { ChemicalKpis } from "./components/ChemicalKpis";
import { useChemicalFilters } from "./use-chemical-filters";

export function ChemicalsPage() {
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>();
  const [hazard, setHazard] = React.useState<string | undefined>();
  const [approval, setApproval] = React.useState<string | undefined>();
  const [expiryFrom, setExpiryFrom] = React.useState<string>("");
  const [expiryTo, setExpiryTo] = React.useState<string>("");
  const [selected, setSelected] = React.useState<Chemical | null>(null);
  const { rows, total, restricted, missingSds, nearExpiry, hazardousStock, nonApproved } = useChemicalFilters({
    search, companyId, hazard, approval, expiryFrom, expiryTo,
  });

  const clearFilters = React.useCallback(() => {
    setSearch("");
    setCompanyId(undefined);
    setHazard(undefined);
    setApproval(undefined);
    setExpiryFrom("");
    setExpiryTo("");
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader actions={<ChemicalCreateDialog facilities={facilities} />} />

      <ChemicalKpis
        total={total}
        restricted={restricted}
        missingSds={missingSds}
        nearExpiry={nearExpiry}
        hazardousStock={hazardousStock}
        nonApproved={nonApproved}
      />

      <ChemicalFiltersBar
        facilities={facilities}
        search={search}
        onSearchChange={setSearch}
        companyId={companyId}
        onCompanyIdChange={setCompanyId}
        hazard={hazard}
        onHazardChange={setHazard}
        approval={approval}
        onApprovalChange={setApproval}
        expiryFrom={expiryFrom}
        onExpiryFromChange={setExpiryFrom}
        expiryTo={expiryTo}
        onExpiryToChange={setExpiryTo}
        onClear={clearFilters}
      />

      <ChemicalsContent rows={rows} selected={selected} onSelect={setSelected} onClear={clearFilters} />
    </div>
  );
}
