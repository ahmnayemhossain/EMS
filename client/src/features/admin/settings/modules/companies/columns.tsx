import type { DataColumn } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { CompanyEntity } from "@/features/admin/settings/modules/companiesApi";

export function buildCompanyColumns(): Array<DataColumn<CompanyEntity>> {
  return [
    { id: "name", header: "Company", cell: (company) => <div className="min-w-0"><div className="truncate text-sm font-medium">{company.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{company.localName || "No local name"}</div></div> },
    { id: "shortName", header: "Short name", cell: (company) => <div className="text-sm font-medium">{company.shortName}</div> },
    { id: "address", header: "Address", cell: (company) => <div className="max-w-[320px] truncate text-sm">{company.address || "-"}</div> },
    { id: "status", header: "Status", cell: (company) => <StatusBadge tone={company.status === 1 ? "compliant" : "neutral"}>{company.status === 1 ? "active" : "inactive"}</StatusBadge>, className: "text-right" },
  ];
}

