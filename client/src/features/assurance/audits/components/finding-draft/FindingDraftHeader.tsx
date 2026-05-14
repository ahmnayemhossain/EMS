import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import type { FindingDraft } from "../core/auditCreate.types";

export function FindingDraftHeader({
  value,
  onRemove,
}: {
  value: FindingDraft;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{value.title || "New finding"}</div>
        <div className="text-muted-foreground mt-1 text-xs">
          {value.customerName ? `${value.customerName} • ` : ""}
          {value.responsibleTeam ? `${value.responsibleTeam} • ` : ""}
          {value.responsiblePerson ? `${value.responsiblePerson} • ` : ""}
          {value.status}
        </div>
      </div>
      <Button type="button" size="icon" variant="ghost" onClick={onRemove}>
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
