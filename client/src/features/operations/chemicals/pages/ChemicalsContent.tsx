import { Button } from "@/components/ui/primitives/button";
import { DataTable } from "@/components/table/DataTable";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import type { Chemical } from "@/core/types/models/ems";

import { getChemicalColumns } from "../config/columns";
import { ChemicalDetail } from "../components/ChemicalDetail";

export function ChemicalsContent({
  rows,
  companies,
  selected,
  onSelect,
  onClear,
}: {
  rows: Chemical[];
  companies: Array<{ id: string; name: string }>;
  selected: Chemical | null;
  onSelect: (chemical: Chemical | null) => void;
  onClear: () => void;
}) {
  const getCompanyName = (id: string) => companies.find((c) => c.id === id)?.name || "Company";
  const columns = getChemicalColumns(getCompanyName);
  const sdsFileName =
    selected?.sds?.files?.[0]?.name ??
    selected?.sds?.files?.[0]?.storedName ??
    (selected?.sdsId ? "SDS record" : undefined);

  return (
    <>
      <div className="space-y-3">
        <DataTable rows={rows} columns={columns} rowKey={(chemical) => chemical.id} onRowClick={onSelect} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-muted-foreground text-xs">{rows.length} rows</div>
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      </div>
      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) onSelect(null);
        }}
        title={selected ? selected.name : "Chemical"}
        description={selected ? `${getCompanyName(String(selected.facilityId))} â€¢ ${selected.storageArea}` : undefined}
      >
        {selected ? <ChemicalDetail chemical={selected} sdsFileName={sdsFileName} /> : null}
      </DetailPanel>
    </>
  );
}


