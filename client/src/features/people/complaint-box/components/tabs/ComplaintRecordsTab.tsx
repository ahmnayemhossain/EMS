import * as React from "react";
import { Download, Printer } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { Button } from "@/components/ui/primitives/button";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { getCompanyName } from "@/core/companies/directory";
import type { ReportBoxRecord } from "@/core/types/models/ems";
import { downloadRecord, getRecordSearchHaystack, printRecord } from "@/features/people/complaint-box/actions/recordExport";
import { formatReportNumber } from "@/features/people/complaint-box/config/utils";

function getRecordCompanyName(record: ReportBoxRecord, companies: ReturnType<typeof useSelectedCompany>["companies"]) {
  return getCompanyName(record.snapshot.facilityId, companies);
}

export function ComplaintRecordsTab({
  records,
  onRequestRemoveRecord,
}: {
  records: ReportBoxRecord[];
  onRequestRemoveRecord: (record: ReportBoxRecord) => void;
}) {
  const { companies } = useSelectedCompany();
  const [recordSearch, setRecordSearch] = React.useState("");

  const filteredRecords = React.useMemo(() => {
    const query = recordSearch.trim().toLowerCase();

    return records
      .filter((record) => (!query ? true : getRecordSearchHaystack(record).includes(query)))
      .sort((left, right) => (left.recordedAt < right.recordedAt ? 1 : -1));
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
          {filteredRecords.map((record) => (
            <div key={record.id} className="rounded-xl border bg-card p-3 shadow-xs">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {record.title?.trim() || formatReportNumber(record.reportId)}{" "}
                    <span className="text-muted-foreground font-normal">•</span>{" "}
                    {getRecordCompanyName(record, companies)}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Complaint #{formatReportNumber(record.reportId)} • Recorded {new Date(record.recordedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                  <Button size="sm" className="w-full sm:w-auto" variant="outline" onClick={() => printRecord(record)}>
                    <Printer className="mr-2 size-4" />
                    Print
                  </Button>
                  <Button size="sm" className="w-full sm:w-auto" variant="outline" onClick={() => downloadRecord(record)}>
                    <Download className="mr-2 size-4" />
                    Download
                  </Button>
                  <Button size="sm" className="w-full sm:w-auto" variant="destructive" onClick={() => onRequestRemoveRecord(record)}>
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
