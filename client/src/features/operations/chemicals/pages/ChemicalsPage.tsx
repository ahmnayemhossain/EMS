import * as React from "react";

import { useSelectedCompany } from "@/core/app/state/slices/company";
import { toast } from "@/core/app/lib/toast";

import { ChemicalsContent } from "./ChemicalsContent";
import { ChemicalCreateDialog } from "../components/ChemicalCreateDialog";
import { ChemicalFiltersBar } from "../components/ChemicalFiltersBar";
import { ChemicalKpis } from "../components/ChemicalKpis";
import { useChemicalsPage } from "../hooks/use-chemicals-page";

export function ChemicalsPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const page = useChemicalsPage({
    selectedCompanyId: selectedCompanyId || undefined,
  });

  return (
    <div className="space-y-6">
      <ChemicalCreateDialog
        companies={companies}
        onCreated={(chemicalId) => {
          void (async () => {
            try {
              const rows = await page.reload();
              page.setSelected(rows.find((row) => row.id === chemicalId) ?? null);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Failed to load chemicals.");
            }
          })();
        }}
      />

      <ChemicalKpis
        total={page.total}
        restricted={page.restricted}
        missingSds={page.missingSds}
        nearExpiry={page.nearExpiry}
        hazardousStock={page.hazardousStock}
        nonApproved={page.nonApproved}
      />

      <ChemicalFiltersBar
        companies={companies}
        search={page.search}
        onSearchChange={page.setSearch}
        companyId={page.companyId}
        onCompanyIdChange={page.setCompanyId}
        hazard={page.hazard}
        onHazardChange={page.setHazard}
        approval={page.approval}
        onApprovalChange={page.setApproval}
        expiryFrom={page.expiryFrom}
        onExpiryFromChange={page.setExpiryFrom}
        expiryTo={page.expiryTo}
        onExpiryToChange={page.setExpiryTo}
        onClear={page.clearFilters}
      />

      {page.loading ? <div className="text-muted-foreground text-sm">Loading chemicals...</div> : null}
      <ChemicalsContent
        rows={page.rows}
        companies={companies}
        selected={page.selected}
        onSelect={page.setSelected}
        onClear={page.clearFilters}
        onUnlinkSds={page.unlinkSdsFromChemical}
        unlinking={page.unlinkingSds}
      />
    </div>
  );
}
