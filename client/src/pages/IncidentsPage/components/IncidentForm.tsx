import * as React from "react";

import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { Facility, Incident } from "@/types/ems";

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
      <div className="grid gap-2">
        <div className="text-muted-foreground text-xs">Factory</div>
        <Select
          value={draft.facilityId || ""}
          onValueChange={(v) => onDraftChange({ ...draft, facilityId: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select factory" />
          </SelectTrigger>
          <SelectContent>
            {facilities.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <div className="text-muted-foreground text-xs">Date</div>
        <Input
          type="date"
          value={draft.date}
          onChange={(e) => onDraftChange({ ...draft, date: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <div className="text-muted-foreground text-xs">Title</div>
        <Input
          value={draft.title}
          onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
          placeholder="Short description"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <div className="text-muted-foreground text-xs">Type</div>
          <Select
            value={draft.type}
            onValueChange={(v) => onDraftChange({ ...draft, type: v as Incident["type"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spill">spill</SelectItem>
              <SelectItem value="chemical_exposure">chemical exposure</SelectItem>
              <SelectItem value="wastewater_exceedance">wastewater exceedance</SelectItem>
              <SelectItem value="fire">fire</SelectItem>
              <SelectItem value="near_miss">near miss</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <div className="text-muted-foreground text-xs">Severity</div>
          <Select
            value={draft.severity}
            onValueChange={(v) =>
              onDraftChange({ ...draft, severity: v as Incident["severity"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">low</SelectItem>
              <SelectItem value="medium">medium</SelectItem>
              <SelectItem value="high">high</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

