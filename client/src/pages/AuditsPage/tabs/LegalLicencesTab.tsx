import { Scale } from "lucide-react";

import { facilities, getFacilityName } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, type DataColumn } from "@/components/DataTable";

type LicenceRow = {
  id: string;
  licence: string;
  authority: string;
  facilityId: string;
  renewalDate: string;
  status: "ok" | "due" | "expired";
};

const rows: LicenceRow[] = [
  {
    id: "lic_1",
    licence: "Environmental Clearance",
    authority: "Regulatory Authority",
    facilityId: facilities[0]?.id ?? "fac_1",
    renewalDate: "2026-06-15",
    status: "due",
  },
  {
    id: "lic_2",
    licence: "Trade Licence",
    authority: "City Corporation",
    facilityId: facilities[1]?.id ?? "fac_2",
    renewalDate: "2026-12-31",
    status: "ok",
  },
  {
    id: "lic_3",
    licence: "Fire Safety Certificate",
    authority: "Fire Service & Civil Defence",
    facilityId: facilities[2]?.id ?? "fac_3",
    renewalDate: "2026-03-30",
    status: "expired",
  },
];

const columns: Array<DataColumn<LicenceRow>> = [
  {
    id: "licence",
    header: "Licence",
    cell: (r) => (
      <div className="min-w-0">
        <div className="text-sm font-medium">{r.licence}</div>
        <div className="text-muted-foreground mt-1 text-xs">{r.authority}</div>
      </div>
    ),
    className: "whitespace-normal",
  },
  {
    id: "factory",
    header: "Factory",
    cell: (r) => <div className="text-sm">{getFacilityName(r.facilityId)}</div>,
    className: "hidden sm:table-cell whitespace-normal",
  },
  {
    id: "renewal",
    header: "Renewal",
    cell: (r) => <div className="text-sm">{r.renewalDate}</div>,
    className: "hidden md:table-cell whitespace-normal",
  },
  {
    id: "status",
    header: "Status",
    cell: (r) => (
      <div className="flex justify-end">
        <StatusBadge
          tone={r.status === "ok" ? "compliant" : r.status === "due" ? "warning" : "critical"}
        >
          {r.status === "ok" ? "OK" : r.status === "due" ? "Due" : "Expired"}
        </StatusBadge>
      </div>
    ),
    className: "text-right whitespace-normal",
  },
];

export function LegalLicencesTab() {
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-4 text-muted-foreground" />
          Legal licences
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} className="hide-scrollbar" />
      </CardContent>
    </Card>
  );
}

