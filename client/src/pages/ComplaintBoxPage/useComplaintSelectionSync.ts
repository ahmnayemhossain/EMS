import * as React from "react";

import type { ReportBoxReport } from "@/types/ems";

export function useComplaintSelectionSync({
  reports,
  selectedComplaint,
  setSelectedComplaint,
}: {
  reports: ReportBoxReport[];
  selectedComplaint: ReportBoxReport | null;
  setSelectedComplaint: (report: ReportBoxReport | null) => void;
}) {
  React.useEffect(() => {
    if (!selectedComplaint) return;
    const latest = reports.find((report) => report.id === selectedComplaint.id) || null;
    setSelectedComplaint(latest);
  }, [reports, selectedComplaint, setSelectedComplaint]);
}
