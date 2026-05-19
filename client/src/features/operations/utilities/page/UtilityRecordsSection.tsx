import { DataTable } from "@/components/table/DataTable";
import { UtilitiesRecordsMobile } from "@/features/operations/utilities/components/UtilitiesRecordsMobile";
import type { DataColumn } from "@/components/table/DataTable";
import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";

export function UtilityRecordsSection(props: {
  isMobile: boolean; rows: UtilityRecord[]; loading: boolean; columns: Array<DataColumn<UtilityRecord>>;
  getCompanyName: (id: string) => string; onSelect: (record: UtilityRecord) => void; approvalFlow?: UtilityApprovalFlow | null;
}) {
  if (props.isMobile) return <UtilitiesRecordsMobile rows={props.rows} getCompanyName={props.getCompanyName} onSelect={props.onSelect} approvalFlow={props.approvalFlow} />;
  if (props.loading) return <div className="text-muted-foreground rounded-xl border p-4 text-sm">Loading utility records...</div>;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Utility records</div>
          <div className="text-muted-foreground text-xs">Click a row to open the detail drawer.</div>
        </div>
      </div>
      <DataTable
        rows={props.rows}
        columns={props.columns}
        rowKey={(row) => String(row.id)}
        onRowClick={props.onSelect}
        className="overflow-hidden rounded-[20px] border-border/70 bg-card/70 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
      />
    </div>
  );
}

