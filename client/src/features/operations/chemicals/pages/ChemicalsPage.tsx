import * as React from "react";

import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useUser } from "@/core/app/state/slices/user";
import { toast } from "@/core/app/lib/toast";
import type { Chemical } from "@/core/types/models/ems";

import { ChemicalsContent } from "./ChemicalsContent";
import { listChemicals, updateChemical } from "../services/api";
import { ChemicalCreateDialog } from "../components/ChemicalCreateDialog";
import { ChemicalFiltersBar } from "../components/ChemicalFiltersBar";
import { ChemicalKpis } from "../components/ChemicalKpis";
import { filterChemicals } from "../hooks/use-chemical-filters";

export function ChemicalsPage() {
  const { userId } = useUser();
  const { companies, selectedCompanyId } = useSelectedCompany();
  const [allRows, setAllRows] = React.useState<Chemical[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>(selectedCompanyId || undefined);
  const [hazard, setHazard] = React.useState<string | undefined>();
  const [approval, setApproval] = React.useState<string | undefined>();
  const [expiryFrom, setExpiryFrom] = React.useState("");
  const [expiryTo, setExpiryTo] = React.useState("");
  const [selected, setSelected] = React.useState<Chemical | null>(null);
  const [unlinkingSds, setUnlinkingSds] = React.useState(false);

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

  React.useEffect(() => {
    if (!selected) return;
    if (!allRows.some((row) => row.id === selected.id)) setSelected(null);
  }, [allRows, selected]);

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
  }, [selectedCompanyId]);

  const applyChemicalUpdate = React.useCallback((updated: Chemical) => {
    setAllRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setSelected(updated);
  }, []);

  const unlinkSdsFromChemical = React.useCallback(
    async (chemical: Chemical) => {
      if (!chemical.sdsId) return;

      setUnlinkingSds(true);
      try {
        const updated = await updateChemical(userId, chemical.id, {
          facilityId: String(chemical.facilityId),
          name: chemical.name,
          tradeName: chemical.tradeName,
          supplier: chemical.supplier,
          storageArea: chemical.storageArea,
          hazardClasses: chemical.hazardClasses,
          approvalStatus: chemical.approvalStatus,
          stockKg: chemical.stockKg,
          minStockKg: chemical.minStockKg,
          expiryDate: chemical.expiryDate,
          ppe: chemical.ppe,
          storageInstructions: chemical.storageInstructions,
          compatibilityWarnings: chemical.compatibilityWarnings,
          linkedWasteStream: chemical.linkedWasteStream,
          batches: chemical.batches,
        });
        applyChemicalUpdate(updated);
        toast.success("SDS link removed");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not remove SDS link.");
      } finally {
        setUnlinkingSds(false);
      }
    },
    [applyChemicalUpdate, userId],
  );

  return (
    <div className="space-y-6">
      <ChemicalCreateDialog
        companies={companies}
        onCreated={(chemicalId) => {
          void (async () => {
            setLoading(true);
            try {
              const rows = await listChemicals(userId);
              setAllRows(rows);
              setSelected(rows.find((row) => row.id === chemicalId) ?? null);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Failed to load chemicals.");
            } finally {
              setLoading(false);
            }
          })();
        }}
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
      <ChemicalsContent
        rows={rows}
        companies={companies}
        selected={selected}
        onSelect={setSelected}
        onClear={clearFilters}
        onUnlinkSds={unlinkSdsFromChemical}
        unlinking={unlinkingSds}
      />
    </div>
  );
}
