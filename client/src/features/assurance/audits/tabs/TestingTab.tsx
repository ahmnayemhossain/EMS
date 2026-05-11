import { FlaskConical } from "lucide-react";

import { facilities, getFacilityName } from "@/core/data/catalog/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DataTable, type DataColumn } from "@/components/table/DataTable";

type TestingRow = {
  id: string;
  test: string;
  facilityId: string;
  frequency: string;
  nextDate: string;
  status: "scheduled" | "due" | "overdue";
};

const rows: TestingRow[] = [
  {
    id: "test_1",
    test: "ETP influent/effluent lab test",
    facilityId: facilities[0]?.id ?? "fac_1",
    frequency: "Monthly",
    nextDate: "2026-04-25",
    status: "scheduled",
  },
  {
    id: "test_2",
    test: "Stack emission test",
    facilityId: facilities[1]?.id ?? "fac_2",
    frequency: "Quarterly",
    nextDate: "2026-04-10",
    status: "overdue",
  },
  {
    id: "test_3",
    test: "Noise level monitoring",
    facilityId: facilities[2]?.id ?? "fac_3",
    frequency: "Quarterly",
    nextDate: "2026-05-05",
    status: "due",
  },
];

const columns: Array<DataColumn<TestingRow>> = [
  {
    id: "test",
    header: "Testing",
    cell: (r) => (
      <div className="min-w-0">
        <div className="text-sm font-medium">{r.test}</div>
        <div className="text-muted-foreground mt-1 text-xs">
          {getFacilityName(r.facilityId)} â€¢ {r.frequency}
        </div>
      </div>
    ),
    className: "whitespace-normal",
  },
  {
    id: "next",
    header: "Next date",
    cell: (r) => <div className="text-sm">{r.nextDate}</div>,
    className: "hidden md:table-cell whitespace-normal",
  },
  {
    id: "status",
    header: "Status",
    cell: (r) => (
      <div className="flex justify-end">
        <StatusBadge
          tone={
            r.status === "scheduled" ? "neutral" : r.status === "due" ? "warning" : "critical"
          }
        >
          {r.status === "scheduled" ? "Scheduled" : r.status === "due" ? "Due" : "Overdue"}
        </StatusBadge>
      </div>
    ),
    className: "text-right whitespace-normal",
  },
];

export function TestingTab() {
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="size-4 text-muted-foreground" />
          Testing & monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} className="hide-scrollbar" />
      </CardContent>
    </Card>
  );
}


