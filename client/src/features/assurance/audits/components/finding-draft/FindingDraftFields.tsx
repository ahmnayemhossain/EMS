import { SelectFilter } from "@/components/forms/SelectFilter";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";

import { AREAS } from "../../config/audit.constants";
import type { FindingDraft } from "../core/auditCreate.types";
import { STATUSES } from "./constants";

export function FindingDraftFields({
  value,
  onPatch,
}: {
  value: FindingDraft;
  onPatch: (next: Partial<FindingDraft>) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Customer</div>
        <Input value={value.customerName} onChange={(event) => onPatch({ customerName: event.target.value })} placeholder="e.g. Buyer / Internal" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Responsible team</div>
        <Input value={value.responsibleTeam} onChange={(event) => onPatch({ responsibleTeam: event.target.value })} placeholder="e.g. EHS / Utilities" />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-xs text-muted-foreground">Title</div>
        <Input value={value.title} onChange={(event) => onPatch({ title: event.target.value })} placeholder="Finding title" />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-xs text-muted-foreground">Description</div>
        <Textarea value={value.description} onChange={(event) => onPatch({ description: event.target.value })} placeholder="Short description" />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-xs text-muted-foreground">Action</div>
        <Textarea value={value.action} onChange={(event) => onPatch({ action: event.target.value })} placeholder="What needs to be done" />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Area</div>
        <SelectFilter value={value.area} onChange={(next) => onPatch({ area: (next as any) ?? "general" })} placeholder="Select area" items={AREAS} />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Severity</div>
        <SelectFilter
          value={value.severity}
          onChange={(next) => onPatch({ severity: (next as any) ?? "minor" })}
          placeholder="Select severity"
          items={[
            { value: "minor", label: "Minor" },
            { value: "major", label: "Major" },
            { value: "critical", label: "Critical" },
          ]}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Responsible person</div>
        <Input
          value={value.responsiblePerson}
          onChange={(event) => onPatch({ responsiblePerson: event.target.value })}
          placeholder="Person name"
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Status</div>
        <SelectFilter value={value.status} onChange={(next) => onPatch({ status: (next as any) ?? "open" })} placeholder="Select status" items={STATUSES} />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Start</div>
        <Input type="date" value={value.startDate} onChange={(event) => onPatch({ startDate: event.target.value })} />
      </div>
      <div className="grid gap-1.5">
        <div className="text-xs text-muted-foreground">Timeline (due)</div>
        <Input type="date" value={value.dueDate} onChange={(event) => onPatch({ dueDate: event.target.value })} />
      </div>
    </div>
  );
}
