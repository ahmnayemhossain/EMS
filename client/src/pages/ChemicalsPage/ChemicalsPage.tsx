import * as React from "react";

import { Button } from "@/app/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { PageHeader } from "@/components/PageHeader";
import { chemicals, facilities, getFacilityName, sdsRecords } from "@/data/mock";
import type { Chemical, HazardClass } from "@/types/ems";

import { getChemicalColumns } from "./columns";
import { ChemicalCreateDialog } from "./components/ChemicalCreateDialog";
import { ChemicalDetail } from "./components/ChemicalDetail";
import { ChemicalFiltersBar } from "./components/ChemicalFiltersBar";
import { ChemicalKpis } from "./components/ChemicalKpis";
import { daysUntil } from "./utils";

export function ChemicalsPage() {
  const [search, setSearch] = React.useState("");
  const [factoryId, setFactoryId] = React.useState<string | undefined>();
  const [hazard, setHazard] = React.useState<string | undefined>();
  const [approval, setApproval] = React.useState<string | undefined>();
  const [expiryFrom, setExpiryFrom] = React.useState<string>("");
  const [expiryTo, setExpiryTo] = React.useState<string>("");
  const [selected, setSelected] = React.useState<Chemical | null>(null);

  const columns = React.useMemo(() => getChemicalColumns(), []);

  const expiryFromTs = expiryFrom ? new Date(expiryFrom).getTime() : undefined;
  const expiryToTs = expiryTo ? new Date(expiryTo).getTime() : undefined;

  const rows = chemicals
    .filter((c) => (factoryId ? c.facilityId === factoryId : true))
    .filter((c) => (hazard ? c.hazardClasses.includes(hazard as HazardClass) : true))
    .filter((c) =>
      approval ? c.approvalStatus === (approval as Chemical["approvalStatus"]) : true,
    )
    .filter((c) => {
      if (!expiryFromTs && !expiryToTs) return true;
      if (!c.expiryDate) return false;
      const ts = new Date(c.expiryDate).getTime();
      if (expiryFromTs && ts < expiryFromTs) return false;
      if (expiryToTs && ts > expiryToTs) return false;
      return true;
    })
    .filter((c) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.supplier.toLowerCase().includes(q) ||
        c.storageArea.toLowerCase().includes(q) ||
        getFacilityName(c.facilityId).toLowerCase().includes(q)
      );
    });

  const total = rows.length;
  const restricted = rows.filter((c) => c.approvalStatus === "restricted").length;
  const missingSds = rows.filter((c) => !c.sdsId).length;
  const nearExpiry = rows.filter((c) => {
    const d = daysUntil(c.expiryDate);
    return typeof d === "number" && d >= 0 && d <= 60;
  }).length;
  const hazardousStock = rows.filter((c) => c.hazardClasses.length >= 2).length;
  const nonApproved = rows.filter((c) => c.approvalStatus !== "approved").length;

  const sdsById = React.useMemo(() => new Map(sdsRecords.map((s) => [s.id, s])), []);

  const clearFilters = React.useCallback(() => {
    setSearch("");
    setFactoryId(undefined);
    setHazard(undefined);
    setApproval(undefined);
    setExpiryFrom("");
    setExpiryTo("");
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Chemical inventory" actions={<ChemicalCreateDialog facilities={facilities} />} />

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
        factoryId={factoryId}
        onFactoryIdChange={setFactoryId}
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

      <div className="space-y-3">
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(c) => c.id}
          onRowClick={setSelected}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-muted-foreground text-xs">{rows.length} rows</div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      </div>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? selected.name : "Chemical"}
        description={
          selected ? `${getFacilityName(selected.facilityId)} • ${selected.storageArea}` : undefined
        }
      >
        {selected ? (
          <ChemicalDetail
            chemical={selected}
            sdsFileName={selected.sdsId ? sdsById.get(selected.sdsId)?.fileName : undefined}
          />
        ) : null}
      </DetailPanel>
    </div>
  );
}
