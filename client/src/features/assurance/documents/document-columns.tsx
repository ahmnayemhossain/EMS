import { Button } from "@/components/ui/primitives/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { Document } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";
import type { DataColumn } from "@/components/table/DataTable";

export function getDocumentColumns(): Array<DataColumn<Document>> {
  return [{ id: "doc", header: "Document", cell: (item) => <div className="min-w-0"><div className="truncate font-medium">{item.title}</div><div className="text-muted-foreground mt-1 text-xs">{item.category} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ {item.ownerDepartment}</div></div>, className: "min-w-[360px]" }, { id: "company", header: "Company", cell: (item) => <div className="text-sm">{getFacilityName(item.facilityId)}</div>, className: "min-w-[240px]" }, { id: "expiry", header: "Expiry", cell: (item) => <div className="flex justify-end"><StatusBadge tone={item.status === "expired" ? "critical" : item.status === "expiring" ? "warning" : "neutral"}>{item.expiresOn ? formatDate(item.expiresOn) : "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}</StatusBadge></div>, className: "text-right min-w-[160px]" }, { id: "status", header: "Status", cell: (item) => <div className="flex justify-end"><StatusBadge tone={item.status === "valid" ? "compliant" : item.status === "expiring" ? "warning" : "critical"}>{item.status}</StatusBadge></div>, className: "text-right min-w-[140px]" }, { id: "action", header: "", cell: () => <div className="text-right"><Button size="sm" variant="outline">View</Button></div>, className: "text-right" }];
}

