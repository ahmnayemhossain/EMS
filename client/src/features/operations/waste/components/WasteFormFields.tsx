import * as React from "react";

import type { CompanyOption } from "@/core/app/state/slices/company";
import type { WasteRecord } from "@/core/types/models/ems";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";

import type { WasteRecordInput } from "../services/api";

export type WasteFormState = {
  companyId: string;
  date: string;
  stream: string;
  type: string | undefined;
  qtyKg: string;
  storageLocation: string;
  vendor: string;
  disposalStatus: string | undefined;
  manifestNo: string;
  dueBy: string;
  notes: string;
};

export function createWasteFormState(input?: Partial<WasteRecord> & { facilityId?: string }) {
  return {
    companyId: input?.facilityId ? String(input.facilityId) : "",
    date: input?.date || "",
    stream: input?.stream || "",
    type: input?.type,
    qtyKg: typeof input?.qtyKg === "number" ? String(input.qtyKg) : "",
    storageLocation: input?.storageLocation || "",
    vendor: input?.vendor || "",
    disposalStatus: input?.disposalStatus || "stored",
    manifestNo: input?.manifestNo || "",
    dueBy: input?.dueBy || "",
    notes: input?.notes || "",
  };
}

export function toWasteRecordInput(form: WasteFormState): WasteRecordInput {
  return {
    facilityId: form.companyId,
    date: form.date,
    stream: form.stream.trim(),
    type: (form.type as WasteRecord["type"]) || "non_hazardous",
    qtyKg: Number(form.qtyKg),
    storageLocation: form.storageLocation.trim(),
    vendor: form.vendor.trim() || undefined,
    disposalStatus: (form.disposalStatus as WasteRecord["disposalStatus"]) || "stored",
    manifestNo: form.manifestNo.trim() || undefined,
    dueBy: form.dueBy || undefined,
    notes: form.notes.trim() || undefined,
  };
}

export function validateWasteForm(form: WasteFormState) {
  if (!form.companyId) return "Company is required.";
  if (!form.date) return "Date is required.";
  if (!form.stream.trim()) return "Waste stream is required.";
  if (!form.type) return "Waste type is required.";
  if (!form.storageLocation.trim()) return "Storage location is required.";

  const quantity = Number(form.qtyKg);
  if (!Number.isFinite(quantity) || quantity < 0) return "Quantity must be >= 0.";

  return null;
}

export function WasteFormFields({
  form,
  setForm,
  companies,
}: {
  form: WasteFormState;
  setForm: React.Dispatch<React.SetStateAction<WasteFormState>>;
  companies: CompanyOption[];
}) {
  const update = <K extends keyof WasteFormState>(key: K, value: WasteFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Company</div>
        <SelectFilter
          value={form.companyId}
          onChange={(value) => update("companyId", value || "")}
          placeholder="Select company"
          items={companies.map((company) => ({ value: company.id, label: company.name }))}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Date</div>
        <Input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Waste stream</div>
        <Input
          value={form.stream}
          onChange={(event) => update("stream", event.target.value)}
          placeholder="e.g. ETP sludge / used solvent"
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Type</div>
        <SelectFilter
          value={form.type}
          onChange={(value) => update("type", value)}
          placeholder="Select type"
          items={[
            { value: "hazardous", label: "Hazardous" },
            { value: "non_hazardous", label: "Non-hazardous" },
            { value: "recyclable", label: "Recyclable" },
            { value: "sludge", label: "Sludge" },
            { value: "e_waste", label: "E-waste" },
          ]}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Qty (kg)</div>
        <Input type="number" value={form.qtyKg} onChange={(event) => update("qtyKg", event.target.value)} placeholder="0" />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Storage location</div>
        <Input
          value={form.storageLocation}
          onChange={(event) => update("storageLocation", event.target.value)}
          placeholder="e.g. Hazardous waste store"
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Vendor</div>
        <Input value={form.vendor} onChange={(event) => update("vendor", event.target.value)} placeholder="Optional vendor" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Disposal status</div>
        <SelectFilter
          value={form.disposalStatus}
          onChange={(value) => update("disposalStatus", value)}
          placeholder="Select status"
          items={[
            { value: "stored", label: "Stored" },
            { value: "scheduled", label: "Scheduled" },
            { value: "disposed", label: "Disposed" },
          ]}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Manifest no.</div>
        <Input
          value={form.manifestNo}
          onChange={(event) => update("manifestNo", event.target.value)}
          placeholder="Optional manifest number"
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Due by</div>
        <Input type="date" value={form.dueBy} onChange={(event) => update("dueBy", event.target.value)} />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Notes</div>
        <Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Optional notes" />
      </div>
    </div>
  );
}
