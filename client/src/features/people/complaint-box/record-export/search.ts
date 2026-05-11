import { getFacilityName } from "@/core/data/catalog/mock";
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
  const facilityId = record.snapshot.facilityId;
  return facilityId ? getFacilityName(facilityId) : "Unknown company";
}
