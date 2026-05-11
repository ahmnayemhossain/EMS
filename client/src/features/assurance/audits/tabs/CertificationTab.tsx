import { ShieldCheck } from "lucide-react";

import { facilities, getFacilityName } from "@/core/data/catalog/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DataTable, type DataColumn } from "@/components/table/DataTable";

type CertificationRow = {
  id: string;
  certification: string;
  facilityId: string;
  expiryDate: string;
  status: "valid" | "due" | "overdue";
};

const rows: CertificationRow[] = [
  {
    id: "cert_1",
    certification: "ISO 14001 (EMS)",
    facilityId: facilities[0]?.id ?? "fac_1",
    expiryDate: "2026-11-30",
    status: "valid",
  },
  {
    id: "cert_2",
    certification: "ISO 45001 (OHS)",
    facilityId: facilities[1]?.id ?? "fac_2",
    expiryDate: "2026-05-20",
    status: "due",
  },
  {
    id: "cert_3",
    certification: "Buyer EHS Certification",
    facilityId: facilities[2]?.id ?? "fac_3",
    expiryDate: "2026-04-05",
    status: "overdue",
  },
];

const columns: Array<DataColumn<CertificationRow>> = [
  {
    id: "certification",
    header: "Certification",
    cell: (r) => <div className="text-sm font-medium">{r.certification}</div>,
    className: "whitespace-normal",
  },
  {
    id: "facility",
    header: "Company",
    cell: (r) => <div className="text-sm">{getFacilityName(r.facilityId)}</div>,
    className: "hidden sm:table-cell whitespace-normal",
  },
  {
    id: "expiry",
    header: "Expiry",
    cell: (r) => <div className="text-sm">{r.expiryDate}</div>,
    className: "hidden md:table-cell whitespace-normal",
  },
  {
    id: "status",
    header: "Status",
    cell: (r) => (
      <div className="flex justify-end">
        <StatusBadge
          tone={r.status === "valid" ? "compliant" : r.status === "due" ? "warning" : "critical"}
        >
          {r.status === "valid" ? "Valid" : r.status === "due" ? "Due soon" : "Overdue"}
        </StatusBadge>
      </div>
    ),
    className: "text-right whitespace-normal",
  },
];

export function CertificationTab() {
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" />
          Certification
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.id} className="hide-scrollbar" />
      </CardContent>
    </Card>
  );
}


