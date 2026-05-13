import { AvatarStack } from "@/components/layout/primitives/AvatarStack";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { cn } from "@/components/ui/primitives/utils";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { ReportBoxReport } from "@/core/types/models/ems";
import { formatReportNumber, getWorkingUsersForComplaint } from "@/features/people/complaint-box/config/utils";

export function ComplaintList({
  rows,
  onOpenComplaint,
}: {
  rows: ReportBoxReport[];
  onOpenComplaint: (report: ReportBoxReport) => void;
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
      {rows.map((report) => (
        <button
          key={report.id}
          type="button"
          className={cn(
            "rounded-xl border bg-card p-3 text-left shadow-xs transition hover:bg-muted/20",
            report.flagged && "border-destructive/30 bg-destructive/5",
          )}
          onClick={() => onOpenComplaint(report)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {formatReportNumber(report.id)} <span className="text-muted-foreground font-normal">•</span>{" "}
                {report.facilityId ? getFacilityName(report.facilityId) : "Unknown company"}
              </div>
              <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">{report.subject}</div>
            </div>
            <div className="shrink-0 space-y-1 text-right">
              <StatusBadge tone={report.status === "handled" ? "compliant" : report.status === "triaged" ? "warning" : "info"}>
                {report.status}
              </StatusBadge>
              {report.flagged ? <StatusBadge tone="critical">flagged</StatusBadge> : null}
            </div>
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="truncate">{report.assignedTo ? `Supervisor: ${report.assignedTo}` : "Unassigned"}</div>
            <div className="flex items-center gap-2">
              <div className="tabular-nums">{new Date(report.createdAt).toLocaleString()}</div>
              <AvatarStack people={getWorkingUsersForComplaint(report)} className="ml-1" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
