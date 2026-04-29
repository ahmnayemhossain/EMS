import { DataTable } from "@/components/DataTable";
import { UtilitiesRecordsMobile } from "@/pages/UtilitiesPage/UtilitiesRecordsMobile";
import type { DataColumn } from "@/components/DataTable";
import type { UtilityRecord } from "@/types/ems";

export function UtilityRecordsSection(props: {
  isMobile: boolean; rows: UtilityRecord[]; loading: boolean; columns: Array<DataColumn<UtilityRecord>>;
  getCompanyName: (id: string) => string; onSelect: (record: UtilityRecord) => void;
}) {
  if (props.isMobile) return <UtilitiesRecordsMobile rows={props.rows} getCompanyName={props.getCompanyName} onSelect={props.onSelect} />;
  if (props.loading) return <div className="text-muted-foreground rounded-xl border p-4 text-sm">Loading utility records...</div>;
  return <div className="space-y-3"><div className="text-sm font-semibold">Utility records</div><DataTable rows={props.rows} columns={props.columns} rowKey={(row) => String(row.id)} onRowClick={props.onSelect} /></div>;
}
