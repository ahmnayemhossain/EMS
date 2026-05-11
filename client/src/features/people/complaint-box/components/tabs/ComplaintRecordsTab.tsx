import * as React from "react";
import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { ReportBoxRecord } from "@/core/types/models/ems";

import { downloadRecord, getRecordSearchHaystack, printRecord } from "@/features/people/complaint-box/actions/recordExport";
import { formatReportNumber } from "@/features/people/complaint-box/config/utils";
import { getFacilityName } from "@/core/data/catalog/mock";

function getRecordCompanyName(r: ReportBoxRecord) {
  const fid = r.snapshot.facilityId;
  return fid ? getFacilityName(fid) : "Unknown company";
}

export function ComplaintRecordsTab({
  records,
  onRequestRemoveRecord,
}: {
  records: ReportBoxRecord[];
  onRequestRemoveRecord: (r: ReportBoxRecord) => void;
}) {
  const [recordSearch, setRecordSearch] = React.useState("");

  const filteredRecords = React.useMemo(() => {
    const q = recordSearch.trim().toLowerCase();
    return records
      .filter((r) => (!q ? true : getRecordSearchHaystack(r).includes(q)))
      .sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1));
  }, [recordSearch, records]);

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <div className="w-full sm:w-[360px]">
            <SearchInput value={recordSearch} onChange={setRecordSearch} placeholder="Search records..." />
          </div>
        }
        onClear={() => setRecordSearch("")}
      />

      {filteredRecords.length ? (
        <div className="grid gap-3">
          {filteredRecords.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-3 shadow-xs">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {r.title?.trim() || formatReportNumber(r.reportId)}{" "}
                    <span className="text-muted-foreground font-normal">ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</span> {getRecordCompanyName(r)}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Complaint #{formatReportNumber(r.reportId)} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Recorded {new Date(r.recordedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                  <Button size="sm" className="w-full sm:w-auto" variant="outline" onClick={() => printRecord(r)}>
                    <Printer className="mr-2 size-4" />
                    Print
                  </Button>
                  <Button size="sm" className="w-full sm:w-auto" variant="outline" onClick={() => downloadRecord(r)}>
                    <Download className="mr-2 size-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    variant="destructive"
                    onClick={() => onRequestRemoveRecord(r)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No records"
          description="Open a complaint drawer and click Record to save a printable download."
        />
      )}
    </div>
  );
}


