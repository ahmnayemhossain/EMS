import type { ReportBoxRecord } from "@/core/types/models/ems";

import { buildRecordHtml } from "@/features/people/complaint-box/record-export/html";
import { formatReportNumber } from "@/features/people/complaint-box/config/utils";

export function downloadRecord(record: ReportBoxRecord) {
  const blob = new Blob([buildRecordHtml(record)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `complaint-record_${formatReportNumber(record.reportId).replace("/", "-")}.html`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function printRecord(record: ReportBoxRecord) {
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) return;
  popup.document.open();
  popup.document.write(buildRecordHtml(record));
  popup.document.close();
  popup.focus();
  setTimeout(() => {
    try {
      popup.print();
    } catch {
      return;
    }
  }, 250);
}
