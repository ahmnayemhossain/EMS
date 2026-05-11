import * as React from "react";

import { Button } from "@/components/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/primitives/dialog";
import type { Facility, Incident } from "@/core/types/models/ems";

import { IncidentForm } from "./IncidentForm";

function makeIncidentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `inc_${Date.now()}`;
}

export function CreateIncidentDialog({
  open,
  onOpenChange,
  facilities,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilities: Facility[];
  onCreate: (incident: Incident) => void;
}) {
  const [draft, setDraft] = React.useState<{
    facilityId?: string;
    date: string;
    title: string;
    type: Incident["type"];
    severity: Incident["severity"];
  }>(() => ({
    facilityId: facilities[0]?.id,
    date: new Date().toISOString().slice(0, 10),
    title: "",
    type: "near_miss",
    severity: "low",
  }));

  React.useEffect(() => {
    if (!open) return;
    setDraft((d) => ({
      ...d,
      facilityId: d.facilityId ?? facilities[0]?.id,
      date: new Date().toISOString().slice(0, 10),
      title: "",
      type: "near_miss",
      severity: "low",
    }));
  }, [open, facilities]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create incident</DialogTitle>
          <DialogDescription>Log an environmental / safety incident.</DialogDescription>
        </DialogHeader>

        <IncidentForm facilities={facilities} draft={draft} onDraftChange={setDraft} />

        <DialogFooter>
          <Button
            onClick={() => {
              if (!draft.facilityId) return;
              onCreate({
                id: makeIncidentId(),
                facilityId: draft.facilityId,
                date: draft.date,
                title: draft.title.trim() || "Incident",
                type: draft.type,
                severity: draft.severity,
                status: "open",
              });
              onOpenChange(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

