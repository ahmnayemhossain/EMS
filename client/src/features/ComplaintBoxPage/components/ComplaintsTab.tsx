import * as React from "react";

import type { ReportBoxReport } from "@/core/types/ems";

import { ComplaintList } from "@/features/ComplaintBoxPage/components/complaints/ComplaintList";
import { ComplaintsFiltersBar } from "@/features/ComplaintBoxPage/components/complaints/ComplaintsFiltersBar";
import { PublicUrlCard } from "@/features/ComplaintBoxPage/components/complaints/PublicUrlCard";

export function ComplaintsTab({
  reports,
  publicUrl,
  showFlaggedOnly,
  onOpenComplaint,
}: {
  reports: ReportBoxReport[];
  publicUrl: string;
  showFlaggedOnly: boolean;
  onOpenComplaint: (r: ReportBoxReport) => void;
}) {
  const [complaintSearch, setComplaintSearch] = React.useState("");
  const [complaintCompanyId, setComplaintCompanyId] = React.useState<string | undefined>();
  const [complaintStatus, setComplaintStatus] = React.useState<ReportBoxReport["status"] | "all">(
    "all",
  );

  const complaintRows = React.useMemo(() => {
    return reports
      .filter((r) => (complaintCompanyId ? r.facilityId === complaintCompanyId : true))
      .filter((r) => (complaintStatus === "all" ? true : r.status === complaintStatus))
      .filter((r) => (showFlaggedOnly ? r.flagged : true))
      .filter((r) => {
        const q = complaintSearch.trim().toLowerCase();
        if (!q) return true;
        const body = r.messages.map((m) => m.text || "").join(" ").toLowerCase();
        return (
          r.subject.toLowerCase().includes(q) ||
          body.includes(q) ||
          (r.assignedTo || "").toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [complaintCompanyId, complaintSearch, complaintStatus, reports, showFlaggedOnly]);

  return (
    <div className="space-y-4">
      <PublicUrlCard publicUrl={publicUrl} />

      <ComplaintsFiltersBar
        complaintSearch={complaintSearch}
        onComplaintSearchChange={setComplaintSearch}
        complaintCompanyId={complaintCompanyId}
        onComplaintCompanyIdChange={setComplaintCompanyId}
        complaintStatus={complaintStatus}
        onComplaintStatusChange={setComplaintStatus}
        onClear={() => {
          setComplaintSearch("");
          setComplaintCompanyId(undefined);
          setComplaintStatus("all");
        }}
      />

      <ComplaintList rows={complaintRows} onOpenComplaint={onOpenComplaint} />
    </div>
  );
}
