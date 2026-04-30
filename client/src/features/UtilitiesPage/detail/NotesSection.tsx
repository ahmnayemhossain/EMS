import { DetailCard } from "@/features/UtilitiesPage/detail/DetailCard";
import type { UtilityRecord } from "@/core/types/ems";

export function NotesSection({ record }: { record: UtilityRecord }) {
  return (
    <>
      <DetailCard><div className="text-muted-foreground text-xs">Remarks</div><div className="mt-1 text-sm break-words">{record.remarks ?? "—"}</div></DetailCard>
      <DetailCard><div className="text-muted-foreground text-xs">Meter history</div><div className="text-muted-foreground mt-1 text-sm">Placeholder for per-meter ledger and variance explanation.</div></DetailCard>
    </>
  );
}
