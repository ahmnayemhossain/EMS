import { Button } from "@/core/app/components/ui/button";
import { DataTable } from "@/core/components/DataTable";
import { DetailPanel } from "@/core/components/DetailPanel";
import { chemicals, facilities, sdsRecords } from "@/core/data/mock";
import type { Chemical } from "@/core/types/ems";

import { getChemicalColumns } from "./columns";
import { ChemicalDetail } from "./components/ChemicalDetail";
import { getFacilityName } from "@/core/data/mock";

export function ChemicalsContent({
  rows,
  selected,
  onSelect,
  onClear,
}: {
  rows: Chemical[];
  selected: Chemical | null;
  onSelect: (chemical: Chemical | null) => void;
  onClear: () => void;
}) {
  const columns = getChemicalColumns();
  const sdsById = new Map(sdsRecords.map((sds) => [sds.id, sds]));
  return (
    <>
      <div className="space-y-3">
        <DataTable rows={rows} columns={columns} rowKey={(chemical) => chemical.id} onRowClick={onSelect} />
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-muted-foreground text-xs">{rows.length} rows</div><Button variant="outline" size="sm" onClick={onClear}>Clear filters</Button></div>
      </div>
      <DetailPanel open={Boolean(selected)} onOpenChange={(open) => { if (!open) onSelect(null); }} title={selected ? selected.name : "Chemical"} description={selected ? `${getFacilityName(selected.facilityId)} • ${selected.storageArea}` : undefined}>
        {selected ? <ChemicalDetail chemical={selected} sdsFileName={selected.sdsId ? sdsById.get(selected.sdsId)?.fileName : undefined} /> : null}
      </DetailPanel>
    </>
  );
}
