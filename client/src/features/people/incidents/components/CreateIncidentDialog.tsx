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
import type { CompanyOption } from "@/core/app/state/slices/company";
import type { Incident } from "@/core/types/models/ems";

import { IncidentForm } from "./IncidentForm";

function makeIncidentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `inc_${Date.now()}`;
}

export function CreateIncidentDialog({
  open,
  onOpenChange,
  companies,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: CompanyOption[];
  onCreate: (incident: Incident) => void;
}) {
  const [draft, setDraft] = React.useState<{
    facilityId?: string;
    date: string;
    title: string;
    type: Incident["type"];
    severity: Incident["severity"];
  }>(() => ({
    facilityId: companies[0]?.id,
    date: new Date().toISOString().slice(0, 10),
    title: "",
    type: "near_miss",
    severity: "low",
  }));

  React.useEffect(() => {
    if (!open) return;
    setDraft({
      facilityId: companies[0]?.id,
      date: new Date().toISOString().slice(0, 10),
      title: "",
      type: "near_miss",
      severity: "low",
    });
  }, [companies, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create incident</DialogTitle>
          <DialogDescription>Log an environmental or safety incident.</DialogDescription>
        </DialogHeader>

        <IncidentForm companies={companies} draft={draft} onDraftChange={setDraft} />

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
