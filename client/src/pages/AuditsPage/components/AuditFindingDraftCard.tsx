import { Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { SelectFilter } from "@/components/SelectFilter";
import type { AuditFindingRecord } from "@/types/audit";
import { AREAS, AUDITORS } from "../audit.constants";
import type { FindingDraft } from "./auditCreate.types";

const STATUSES: Array<{ value: AuditFindingRecord["status"]; label: string }> = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

export function AuditFindingDraftCard({
  value,
  onPatch,
  onRemove,
}: {
  value: FindingDraft;
  onPatch: (next: Partial<FindingDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="rounded-xl border p-3 shadow-none">
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
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Customer</div>
          <Input
            value={value.customerName}
            onChange={(e) => onPatch({ customerName: e.target.value })}
            placeholder="e.g. Buyer / Internal"
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Responsible team</div>
          <Input
            value={value.responsibleTeam}
            onChange={(e) => onPatch({ responsibleTeam: e.target.value })}
            placeholder="e.g. EHS / Utilities"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Title</div>
          <Input
            value={value.title}
            onChange={(e) => onPatch({ title: e.target.value })}
            placeholder="Finding title"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Description</div>
          <Textarea
            value={value.description}
            onChange={(e) => onPatch({ description: e.target.value })}
            placeholder="Short description"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Action</div>
          <Textarea
            value={value.action}
            onChange={(e) => onPatch({ action: e.target.value })}
            placeholder="What needs to be done"
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Area</div>
          <SelectFilter
            value={value.area}
            onChange={(v) => onPatch({ area: (v as any) ?? "general" })}
            placeholder="Select area"
            items={AREAS}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Severity</div>
          <SelectFilter
            value={value.severity}
            onChange={(v) => onPatch({ severity: (v as any) ?? "minor" })}
            placeholder="Select severity"
            items={[
              { value: "minor", label: "Minor" },
              { value: "major", label: "Major" },
              { value: "critical", label: "Critical" },
            ]}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Responsible person</div>
          <SelectFilter
            value={value.responsiblePerson}
            onChange={(v) => onPatch({ responsiblePerson: v ?? "" })}
            placeholder="Select person"
            items={AUDITORS.map((a) => ({ value: a, label: a }))}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Status</div>
          <SelectFilter
            value={value.status}
            onChange={(v) => onPatch({ status: (v as any) ?? "open" })}
            placeholder="Select status"
            items={STATUSES}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Start</div>
          <Input
            type="date"
            value={value.startDate}
            onChange={(e) => onPatch({ startDate: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Timeline (due)</div>
          <Input
            type="date"
            value={value.dueDate}
            onChange={(e) => onPatch({ dueDate: e.target.value })}
          />
        </div>
      </div>
    </Card>
  );
}

