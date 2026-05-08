import * as React from "react";

import { PageHeader } from "@/core/components/PageHeader";
import { useSelectedCompany } from "@/core/app/state/company";
import { useUser } from "@/core/app/state/user";
import { toast } from "@/core/app/lib/toast";
import type { Chemical } from "@/core/types/ems";

import { ChemicalsContent } from "./ChemicalsContent";
import { listChemicals } from "./api";
import { ChemicalCreateDialog } from "./components/ChemicalCreateDialog";
import { ChemicalFiltersBar } from "./components/ChemicalFiltersBar";
import { ChemicalKpis } from "./components/ChemicalKpis";
import { filterChemicals } from "./use-chemical-filters";

export function ChemicalsPage() {
  const { userId } = useUser();
  const { companies, selectedCompanyId } = useSelectedCompany();
  const [allRows, setAllRows] = React.useState<Chemical[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>(selectedCompanyId || undefined);
  const [hazard, setHazard] = React.useState<string | undefined>();
  const [approval, setApproval] = React.useState<string | undefined>();
  const [expiryFrom, setExpiryFrom] = React.useState<string>("");
  const [expiryTo, setExpiryTo] = React.useState<string>("");
  const [selected, setSelected] = React.useState<Chemical | null>(null);

  React.useEffect(() => {
    setCompanyId(selectedCompanyId || undefined);
  }, [selectedCompanyId]);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const rows = await listChemicals(userId);
        if (!cancelled) setAllRows(rows);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Failed to load chemicals.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const { rows, total, restricted, missingSds, nearExpiry, hazardousStock, nonApproved } = React.useMemo(
    () =>
      filterChemicals({
        rows: allRows,
        search,
        companyId,
        hazard,
        approval,
        expiryFrom,
        expiryTo,
      }),
    [allRows, search, companyId, hazard, approval, expiryFrom, expiryTo],
  );

  const clearFilters = React.useCallback(() => {
    setSearch("");
    setCompanyId(selectedCompanyId || undefined);
    setHazard(undefined);
    setApproval(undefined);
    setExpiryFrom("");
    setExpiryTo("");
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <ChemicalCreateDialog
            companies={companies}
            onCreated={() => {
              // Reload after create (keeps state simple).
              void (async () => {
                setLoading(true);
                try {
                  const rows = await listChemicals(userId);
                  setAllRows(rows);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Failed to load chemicals.");
                } finally {
                  setLoading(false);
                }
              })();
            }}
          />
        }
      />

      <ChemicalKpis
        total={total}
        restricted={restricted}
        missingSds={missingSds}
        nearExpiry={nearExpiry}
        hazardousStock={hazardousStock}
        nonApproved={nonApproved}
      />

      <ChemicalFiltersBar
        companies={companies}
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

      {loading ? <div className="text-muted-foreground text-sm">Loading chemicals...</div> : null}
      <ChemicalsContent rows={rows} companies={companies} selected={selected} onSelect={setSelected} onClear={clearFilters} />
    </div>
  );
}
