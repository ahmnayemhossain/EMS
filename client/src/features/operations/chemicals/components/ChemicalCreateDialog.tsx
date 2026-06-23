import * as React from "react";

import type { CompanyOption } from "@/core/app/state/slices/company";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import type { SDSRecord } from "@/core/types/models/ems";
import { Input } from "@/components/ui/primitives/input";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { SelectFilter } from "@/components/forms/SelectFilter";

import { createChemical, listChemicalSdsRecords } from "../services/api";

const MANUAL_SDS_VALUE = "__manual__";

export function ChemicalCreateDialog({
  companies,
  onCreated,
}: {
  companies: CompanyOption[];
  onCreated: (chemicalId: string) => void;
}) {
  const { userId } = useUser();
  const [companyId, setCompanyId] = React.useState("");
  const [supplier, setSupplier] = React.useState("");
  const [name, setName] = React.useState("");
  const [stockKg, setStockKg] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [storageArea, setStorageArea] = React.useState("");
  const [sdsRows, setSdsRows] = React.useState<SDSRecord[]>([]);
  const [sdsValue, setSdsValue] = React.useState(MANUAL_SDS_VALUE);

  React.useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const data = await listChemicalSdsRecords(userId);
        if (active) setSdsRows(data);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Could not load SDS records.");
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const selectedSds = React.useMemo(
    () => sdsRows.find((row) => row.id === sdsValue),
    [sdsRows, sdsValue],
  );

  React.useEffect(() => {
    if (!selectedSds) return;
    setName(selectedSds.chemicalName || "");
    setSupplier(selectedSds.supplier || "");
  }, [selectedSds]);

  return (
    <CreateActionDialog
      title="Create chemical"
      triggerLabel="Create chemical"
      triggerVariant="floating"
      onCreate={async () => {
        if (!companyId) return toast.error("Company is required."), false;
        if (!supplier.trim()) return toast.error("Supplier is required."), false;
        if (!name.trim()) return toast.error("Chemical name is required."), false;
        if (!storageArea.trim()) return toast.error("Storage area is required."), false;

        const stock = Number(stockKg);
        if (!Number.isFinite(stock) || stock < 0) return toast.error("Stock must be a number >= 0."), false;

        try {
          const created = await createChemical(userId, {
            facilityId: companyId,
            name: name.trim(),
            supplier: supplier.trim(),
            storageArea: storageArea.trim(),
            hazardClasses: [],
            approvalStatus: "pending",
            stockKg: stock,
            expiryDate: expiryDate || undefined,
            sdsId: selectedSds?.id,
            ppe: [],
            storageInstructions: [],
            compatibilityWarnings: [],
            linkedWasteStream: undefined,
            batches: [],
          });

          onCreated(created.id);
          toast.success("Chemical created");
          setCompanyId("");
          setSupplier("");
          setName("");
          setStockKg("");
          setExpiryDate("");
          setStorageArea("");
          setSdsValue(MANUAL_SDS_VALUE);
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Create failed.");
          return false;
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Company</div>
          <SelectFilter
            value={companyId}
            onChange={setCompanyId}
            placeholder="Select company"
            items={companies.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">SDS</div>
          <SelectFilter
            value={sdsValue}
            onChange={setSdsValue}
            placeholder="Select SDS"
            items={[
              { value: MANUAL_SDS_VALUE, label: "No SDS link" },
              ...sdsRows.map((row) => ({
                value: row.id,
                label: `${row.chemicalName} - ${row.supplier}`,
              })),
            ]}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Supplier</div>
          <Input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Supplier name"
            disabled={Boolean(selectedSds)}
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Chemical name</div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chemical name"
            disabled={Boolean(selectedSds)}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Stock (kg)</div>
          <Input type="number" value={stockKg} onChange={(e) => setStockKg(e.target.value)} placeholder="0" />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Expiry date</div>
          <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Storage area</div>
          <Input value={storageArea} onChange={(e) => setStorageArea(e.target.value)} placeholder="e.g. Oxidizer store" />
        </div>
      </div>
    </CreateActionDialog>
  );
}
