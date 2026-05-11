import * as React from "react";

import { Input } from "@/components/ui/primitives/input";
import type { Facility, Incident } from "@/core/types/models/ems";
import { IncidentSelectField } from "@/features/people/incidents/components/IncidentSelectField";

export function IncidentForm({
  facilities,
  draft,
  onDraftChange,
}: {
  facilities: Facility[];
  draft: {
    facilityId?: string;
    date: string;
    title: string;
    type: Incident["type"];
    severity: Incident["severity"];
  };
  onDraftChange: (next: {
    facilityId?: string;
    date: string;
    title: string;
    type: Incident["type"];
    severity: Incident["severity"];
  }) => void;
}) {
  return (
    <div className="grid gap-3">
      <IncidentSelectField label="Company" value={draft.facilityId || ""} placeholder="Select company" options={facilities.map((facility) => ({ value: facility.id, label: facility.name }))} onChange={(value) => onDraftChange({ ...draft, facilityId: value })} />
      <div className="grid gap-2">
        <div className="text-muted-foreground text-xs">Date</div>
        <Input type="date" value={draft.date} onChange={(e) => onDraftChange({ ...draft, date: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <div className="text-muted-foreground text-xs">Title</div>
        <Input value={draft.title} onChange={(e) => onDraftChange({ ...draft, title: e.target.value })} placeholder="Short description" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <IncidentSelectField label="Type" value={draft.type} options={[{ value: "spill", label: "spill" }, { value: "chemical_exposure", label: "chemical exposure" }, { value: "wastewater_exceedance", label: "wastewater exceedance" }, { value: "fire", label: "fire" }, { value: "near_miss", label: "near miss" }]} onChange={(value) => onDraftChange({ ...draft, type: value as Incident["type"] })} />
        <IncidentSelectField label="Severity" value={draft.severity} options={[{ value: "low", label: "low" }, { value: "medium", label: "medium" }, { value: "high", label: "high" }]} onChange={(value) => onDraftChange({ ...draft, severity: value as Incident["severity"] })} />
      </div>
    </div>
  );
}

