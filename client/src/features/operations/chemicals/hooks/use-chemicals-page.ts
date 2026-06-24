import * as React from "react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import type { Chemical } from "@/core/types/models/ems";

import { filterChemicals } from "@/features/operations/chemicals/hooks/use-chemical-filters";
import { listChemicals, updateChemical } from "@/features/operations/chemicals/services/api";

type UseChemicalsPageArgs = {
  selectedCompanyId?: string;
};

export function useChemicalsPage(props: UseChemicalsPageArgs) {
  const { userId } = useUser();
  const [allRows, setAllRows] = React.useState<Chemical[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [companyId, setCompanyId] = React.useState<string | undefined>(props.selectedCompanyId);
  const [hazard, setHazard] = React.useState<string | undefined>();
  const [approval, setApproval] = React.useState<string | undefined>();
  const [expiryFrom, setExpiryFrom] = React.useState("");
  const [expiryTo, setExpiryTo] = React.useState("");
  const [selected, setSelected] = React.useState<Chemical | null>(null);
  const [unlinkingSds, setUnlinkingSds] = React.useState(false);

  React.useEffect(() => {
    setCompanyId(props.selectedCompanyId);
  }, [props.selectedCompanyId]);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listChemicals(userId);
      setAllRows(rows);
      return rows;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load chemicals.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const rows = await listChemicals(userId);
        if (!cancelled) {
          setAllRows(rows);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load chemicals.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  React.useEffect(() => {
    if (!selected) {
      return;
    }
    if (!allRows.some((row) => row.id === selected.id)) {
      setSelected(null);
    }
  }, [allRows, selected]);

  const metrics = React.useMemo(
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
    setCompanyId(props.selectedCompanyId);
    setHazard(undefined);
    setApproval(undefined);
    setExpiryFrom("");
    setExpiryTo("");
  }, [props.selectedCompanyId]);

  const applyChemicalUpdate = React.useCallback((updated: Chemical) => {
    setAllRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setSelected(updated);
  }, []);

  const unlinkSdsFromChemical = React.useCallback(
    async (chemical: Chemical) => {
      if (!chemical.sdsId) {
        return;
      }

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

  return {
    loading,
    search,
    setSearch,
    companyId,
    setCompanyId,
    hazard,
    setHazard,
    approval,
    setApproval,
    expiryFrom,
    setExpiryFrom,
    expiryTo,
    setExpiryTo,
    selected,
    setSelected,
    unlinkingSds,
    rows: metrics.rows,
    total: metrics.total,
    restricted: metrics.restricted,
    missingSds: metrics.missingSds,
    nearExpiry: metrics.nearExpiry,
    hazardousStock: metrics.hazardousStock,
    nonApproved: metrics.nonApproved,
    clearFilters,
    reload,
    unlinkSdsFromChemical,
  };
}
