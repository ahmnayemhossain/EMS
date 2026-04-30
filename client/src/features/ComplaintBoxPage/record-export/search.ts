import { getFacilityName } from "@/core/data/mock";
import type { ReportBoxRecord } from "@/core/types/ems";

import { formatReportNumber } from "@/features/ComplaintBoxPage/utils";

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
  const facilityId = record.snapshot.facilityId;
  return facilityId ? getFacilityName(facilityId) : "Unknown company";
}
