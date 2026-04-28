import { AvatarStack } from "@/components/AvatarStack";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/app/components/ui/utils";
import { getFacilityName } from "@/data/mock";
import type { ReportBoxReport } from "@/types/ems";

import { formatReportNumber, getWorkingUsersForComplaint } from "@/pages/ComplaintBoxPage/utils";

export function ComplaintList({
  rows,
  onOpenComplaint,
}: {
  rows: ReportBoxReport[];
  onOpenComplaint: (r: ReportBoxReport) => void;
}) {
  if (!rows.length) {
    return (
      <EmptyState
        title="No complaints"
        description="Complaints will appear here after workers submit from the public URL."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {rows.map((r) => (
        <button
          key={r.id}
          type="button"
          className={cn(
            "rounded-xl border bg-card p-3 text-left shadow-xs transition hover:bg-muted/20",
            r.flagged && "border-destructive/30 bg-destructive/5",
          )}
          onClick={() => onOpenComplaint(r)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {formatReportNumber(r.id)}{" "}
                <span className="text-muted-foreground font-normal">•</span>{" "}
                {r.facilityId ? getFacilityName(r.facilityId) : "Unknown company"}
              </div>
              <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">{r.subject}</div>
            </div>
            <div className="shrink-0 space-y-1 text-right">
              <StatusBadge
                tone={
                  r.status === "handled" ? "compliant" : r.status === "triaged" ? "warning" : "info"
                }
              >
                {r.status}
              </StatusBadge>
              {r.flagged ? <StatusBadge tone="critical">flagged</StatusBadge> : null}
            </div>
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="truncate">{r.assignedTo ? `Supervisor: ${r.assignedTo}` : "Unassigned"}</div>
            <div className="flex items-center gap-2">
              <div className="tabular-nums">{new Date(r.createdAt).toLocaleString()}</div>
              <AvatarStack people={getWorkingUsersForComplaint(r)} className="ml-1" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

