import { Plus } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";

import type { FindingDraft } from "./auditCreate.types";
import { AuditFindingDraftCard } from "./AuditFindingDraftCard";

function newDraft(): FindingDraft {
  return {
    id: `fd_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    severity: "minor",
    area: "general",
    customerName: "",
    title: "",
    description: "",
    action: "",
    responsiblePerson: "",
    responsibleTeam: "",
    startDate: "",
    dueDate: "",
    status: "open",
  };
}

export function AuditFindingsDraft({
  value,
  onChange,
}: {
  value: FindingDraft[];
  onChange: (next: FindingDraft[]) => void;
}) {
  const add = () => onChange([...value, newDraft()]);
  const remove = (id: string) => onChange(value.filter((x) => x.id !== id));
  const patch = (id: string, next: Partial<FindingDraft>) =>
    onChange(value.map((x) => (x.id === id ? { ...x, ...next } : x)));

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">Findings (optional)</div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-2 size-4" />
          Add finding
        </Button>
      </div>

      {!value.length ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          No findings added.
        </div>
      ) : null}

      <div className="space-y-3">
        {value.map((f) => (
          <AuditFindingDraftCard
            key={f.id}
            value={f}
            onRemove={() => remove(f.id)}
            onPatch={(next) => patch(f.id, next)}
          />
        ))}
      </div>
    </div>
  );
}

