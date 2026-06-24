import * as React from "react";

import { Button } from "@/components/ui/primitives/button";
import { DataTable } from "@/components/table/DataTable";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import type { Chemical } from "@/core/types/models/ems";

import { ChemicalDetail } from "../components/ChemicalDetail";
import { getChemicalColumns } from "../config/columns";

type ChemicalsContentProps = {
  rows: Chemical[];
  companies: Array<{ id: string; name: string }>;
  selected: Chemical | null;
  onSelect: (chemical: Chemical | null) => void;
  onClear: () => void;
  onUnlinkSds: (chemical: Chemical) => Promise<void>;
  unlinking: boolean;
};

export function ChemicalsContent({
  rows,
  companies,
  selected,
  onSelect,
  onClear,
  onUnlinkSds,
  unlinking,
}: ChemicalsContentProps) {
  const [confirmUnlink, setConfirmUnlink] = React.useState(false);
  const getCompanyName = (id: string) => companies.find((company) => company.id === id)?.name || "Company";
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
          if (!open) {
            setConfirmUnlink(false);
            onSelect(null);
          }
        }}
        title={selected ? selected.name : "Chemical"}
        description={selected ? `${getCompanyName(String(selected.facilityId))} • ${selected.storageArea}` : undefined}
        overlay={
          selected && confirmUnlink ? (
            <div className="absolute inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-lg border bg-background p-5 text-center shadow-2xl">
                <div className="text-base font-semibold">Remove SDS link?</div>
                <div className="text-muted-foreground mt-2 text-sm leading-6">
                  This will unlink the SDS from <span className="font-medium text-foreground">{selected.name}</span>.
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" disabled={unlinking} onClick={() => setConfirmUnlink(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={unlinking}
                    onClick={async () => {
                      await onUnlinkSds(selected);
                      setConfirmUnlink(false);
                    }}
                  >
                    {unlinking ? "Removing..." : "Remove"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null
        }
      >
        {selected ? (
          <ChemicalDetail
            chemical={selected}
            sdsFileName={sdsFileName}
            onUnlinkSds={selected.sdsId ? () => setConfirmUnlink(true) : undefined}
            unlinking={unlinking}
          />
        ) : null}
      </DetailPanel>
    </>
  );
}
