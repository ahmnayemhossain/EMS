import { Card } from "@/components/ui/primitives/card";

import type { FindingDraft } from "./auditCreate.types";
import { FindingDraftFields } from "../finding-draft/FindingDraftFields";
import { FindingDraftHeader } from "../finding-draft/FindingDraftHeader";

export function AuditFindingDraftCard({ value, onPatch, onRemove }: { value: FindingDraft; onPatch: (next: Partial<FindingDraft>) => void; onRemove: () => void; }) {
  return <Card className="rounded-xl border p-3 shadow-none"><FindingDraftHeader value={value} onRemove={onRemove} /><FindingDraftFields value={value} onPatch={onPatch} /></Card>;
}

