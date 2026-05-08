import * as React from "react";
import { ShieldCheck } from "lucide-react";

import type { CompanyOption } from "@/core/app/state/company";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/user";
import { Button } from "@/core/app/components/ui/button";
import { Input } from "@/core/app/components/ui/input";
import { Textarea } from "@/core/app/components/ui/textarea";
import { CreateActionDialog } from "@/core/components/CreateActionDialog";
import { SelectFilter } from "@/core/components/SelectFilter";

import { createChemical } from "../api";

export function ChemicalCreateDialog({
  companies,
  onCreated,
}: {
  companies: CompanyOption[];
  onCreated: (chemicalId: string) => void;
}) {
  const { userId } = useUser();
  const [companyId, setCompanyId] = React.useState<string>("");
  const [supplier, setSupplier] = React.useState("");
  const [name, setName] = React.useState("");
  const [stockKg, setStockKg] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [storageArea, setStorageArea] = React.useState("");
  const [notes, setNotes] = React.useState("");

  return (
    <CreateActionDialog
      title="Create chemical"
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
            sdsId: undefined,
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
          setNotes("");
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
          <div className="text-muted-foreground text-xs">Supplier</div>
          <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier name" />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Chemical name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chemical name" />
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
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Notes</div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
          <div className="text-sm font-medium">Approval workflow</div>
          <Button type="button" variant="outline" size="sm">
            <ShieldCheck className="mr-2 size-4" />
            Open
          </Button>
        </div>
      </div>
    </CreateActionDialog>
  );
}
