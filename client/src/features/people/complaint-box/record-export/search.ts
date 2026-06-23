import { getCompanyName } from "@/core/companies/directory";
import type { ReportBoxRecord } from "@/core/types/models/ems";

import { formatReportNumber } from "@/features/people/complaint-box/config/utils";

export function getRecordSearchHaystack(record: ReportBoxRecord) {
  return [
    formatReportNumber(record.reportId),
    record.snapshot.subject,
    record.snapshot.assignedTo || "",
    record.snapshot.category || "",
    getRecordCompanyName(record),
  ]
    .join(" ")
    .toLowerCase();
}

function getRecordCompanyName(record: ReportBoxRecord) {
  return getCompanyName(record.snapshot.facilityId);
}
