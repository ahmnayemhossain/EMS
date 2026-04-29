import { getFacilityName } from "@/data/mock";
import type { ReportBoxRecord } from "@/types/ems";

import { formatReportNumber } from "@/pages/ComplaintBoxPage/utils";

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
