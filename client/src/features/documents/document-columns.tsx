import { Button } from "@/core/app/components/ui/button";
import { StatusBadge } from "@/core/components/StatusBadge";
import { getFacilityName } from "@/core/data/mock";
import type { Document } from "@/core/types/ems";
import { formatDate } from "@/core/utils/format";
import type { DataColumn } from "@/core/components/DataTable";

export function getDocumentColumns(): Array<DataColumn<Document>> {
  return [{ id: "doc", header: "Document", cell: (item) => <div className="min-w-0"><div className="truncate font-medium">{item.title}</div><div className="text-muted-foreground mt-1 text-xs">{item.category} • {item.ownerDepartment}</div></div>, className: "min-w-[360px]" }, { id: "company", header: "Company", cell: (item) => <div className="text-sm">{getFacilityName(item.facilityId)}</div>, className: "min-w-[240px]" }, { id: "expiry", header: "Expiry", cell: (item) => <div className="flex justify-end"><StatusBadge tone={item.status === "expired" ? "critical" : item.status === "expiring" ? "warning" : "neutral"}>{item.expiresOn ? formatDate(item.expiresOn) : "—"}</StatusBadge></div>, className: "text-right min-w-[160px]" }, { id: "status", header: "Status", cell: (item) => <div className="flex justify-end"><StatusBadge tone={item.status === "valid" ? "compliant" : item.status === "expiring" ? "warning" : "critical"}>{item.status}</StatusBadge></div>, className: "text-right min-w-[140px]" }, { id: "action", header: "", cell: () => <div className="text-right"><Button size="sm" variant="outline">View</Button></div>, className: "text-right" }];
}
