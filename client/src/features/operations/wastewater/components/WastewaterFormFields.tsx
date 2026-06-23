import * as React from "react";

import type { CompanyOption } from "@/core/app/state/slices/company";
import type { WastewaterRecord } from "@/core/types/models/ems";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";

import type { WastewaterRecordInput } from "../services/api";

export type WastewaterFormState = {
  companyId: string;
  sampleDate: string;
  point: string | undefined;
  pH: string;
  COD: string;
  BOD: string;
  TSS: string;
  DO: string;
  labReportFileName: string;
  notes: string;
};

export function createWastewaterFormState(input?: Partial<WastewaterRecord> & { facilityId?: string }) {
  return {
    companyId: input?.facilityId ? String(input.facilityId) : "",
    sampleDate: input?.sampleDate || "",
    point: input?.point || "outlet",
    pH: typeof input?.pH === "number" ? String(input.pH) : "",
    COD: typeof input?.COD === "number" ? String(input.COD) : "",
    BOD: typeof input?.BOD === "number" ? String(input.BOD) : "",
    TSS: typeof input?.TSS === "number" ? String(input.TSS) : "",
    DO: typeof input?.DO === "number" ? String(input.DO) : "",
    labReportFileName: input?.labReport?.fileName || "",
    notes: input?.notes || "",
  };
}

export function toWastewaterRecordInput(form: WastewaterFormState): WastewaterRecordInput {
  return {
    facilityId: form.companyId,
    sampleDate: form.sampleDate,
    point: (form.point as WastewaterRecord["point"]) || "outlet",
    pH: Number(form.pH),
    COD: Number(form.COD),
    BOD: Number(form.BOD),
    TSS: Number(form.TSS),
    DO: form.DO === "" ? undefined : Number(form.DO),
    labReportFileName: form.labReportFileName.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

export function validateWastewaterForm(form: WastewaterFormState) {
  if (!form.companyId) return "Company is required.";
  if (!form.sampleDate) return "Sample date is required.";
  if (!form.point) return "Point is required.";

  const requiredMetrics = [form.pH, form.COD, form.BOD, form.TSS].map((value) => Number(value));
  if (!requiredMetrics.every(Number.isFinite)) return "pH, COD, BOD and TSS are required.";

  const doValue = form.DO === "" ? null : Number(form.DO);
  if (doValue !== null && !Number.isFinite(doValue)) return "DO must be a number.";

  return null;
}

export function WastewaterFormFields({
  form,
  setForm,
  companies,
}: {
  form: WastewaterFormState;
  setForm: React.Dispatch<React.SetStateAction<WastewaterFormState>>;
  companies: CompanyOption[];
}) {
  const update = <K extends keyof WastewaterFormState>(key: K, value: WastewaterFormState[K]) => {
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
        <div className="text-muted-foreground text-xs">Sample date</div>
        <Input type="date" value={form.sampleDate} onChange={(event) => update("sampleDate", event.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Point</div>
        <SelectFilter
          value={form.point}
          onChange={(value) => update("point", value)}
          placeholder="Select point"
          items={[
            { value: "inlet", label: "Inlet" },
            { value: "outlet", label: "Outlet" },
          ]}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">pH</div>
        <Input type="number" value={form.pH} onChange={(event) => update("pH", event.target.value)} placeholder="0" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">COD</div>
        <Input type="number" value={form.COD} onChange={(event) => update("COD", event.target.value)} placeholder="0" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">BOD</div>
        <Input type="number" value={form.BOD} onChange={(event) => update("BOD", event.target.value)} placeholder="0" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">TSS</div>
        <Input type="number" value={form.TSS} onChange={(event) => update("TSS", event.target.value)} placeholder="0" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">DO</div>
        <Input type="number" value={form.DO} onChange={(event) => update("DO", event.target.value)} placeholder="Optional" />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Lab report reference</div>
        <Input
          value={form.labReportFileName}
          onChange={(event) => update("labReportFileName", event.target.value)}
          placeholder="Optional report reference"
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Notes</div>
        <Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Optional notes" />
      </div>
    </div>
  );
}
