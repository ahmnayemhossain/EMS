import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { DataColumn } from "@/components/table/DataTable";
import type { Document } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

export function getDocumentColumns(): Array<DataColumn<Document>> {
  return [
    {
      id: "document",
      header: "Document",
      className: "min-w-[340px]",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{row.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {row.category} - {row.ownerDepartment}
          </div>
        </div>
      ),
    },
    {
      id: "company",
      header: "Company",
      cell: (row) => <div className="text-sm">{row.companyName || row.facilityId}</div>,
    },
    {
      id: "expiry",
      header: "Expiry",
      cell: (row) => <div className="text-sm">{row.expiresOn ? formatDate(row.expiresOn) : "No expiry"}</div>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <DocumentStatusBadge status={row.status} />,
      className: "text-right",
    },
  ];
}

export function DocumentStatusBadge({ status }: { status: Document["status"] }) {
  return (
    <StatusBadge
      tone={
        status === "expired"
          ? "critical"
          : status === "expiring"
            ? "warning"
            : "compliant"
      }
    >
      {status}
    </StatusBadge>
  );
}
