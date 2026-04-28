import * as React from "react";
import { FileText } from "lucide-react";

import { documents, facilities, getFacilityName } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/format";
import type { Document } from "@/types/ems";

export function DocumentsPage() {
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();

  const rows = documents
    .filter((d) => (facilityId ? d.facilityId === facilityId : true))
    .filter((d) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.ownerDepartment.toLowerCase().includes(q) ||
        getFacilityName(d.facilityId).toLowerCase().includes(q)
      );
    });

  const cols: Array<DataColumn<Document>> = [
    {
      id: "doc",
      header: "Document",
      cell: (d) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{d.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {d.category} • {d.ownerDepartment}
          </div>
        </div>
      ),
      className: "min-w-[360px]",
    },
    {
      id: "company",
      header: "Company",
      cell: (d) => <div className="text-sm">{getFacilityName(d.facilityId)}</div>,
      className: "min-w-[240px]",
    },
    {
      id: "expiry",
      header: "Expiry",
      cell: (d) => (
        <div className="flex justify-end">
          <StatusBadge
            tone={
              d.status === "expired"
                ? "critical"
                : d.status === "expiring"
                  ? "warning"
                  : "neutral"
            }
          >
            {d.expiresOn ? formatDate(d.expiresOn) : "—"}
          </StatusBadge>
        </div>
      ),
      className: "text-right min-w-[160px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (d) => (
        <div className="flex justify-end">
          <StatusBadge
            tone={
              d.status === "valid"
                ? "compliant"
                : d.status === "expiring"
                  ? "warning"
                  : "critical"
            }
          >
            {d.status}
          </StatusBadge>
        </div>
      ),
      className: "text-right min-w-[140px]",
    },
    {
      id: "action",
      header: "",
      cell: () => (
        <div className="text-right">
          <Button size="sm" variant="outline">
            View
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button variant="outline">
            <FileText className="mr-2 size-4" />
            Upload document
          </Button>
        }
      />

      <FilterBar
        left={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search documents…" />
            </div>
            <SelectFilter
              value={facilityId}
              onChange={setFacilityId}
              placeholder="Company"
              items={facilities.map((f) => ({ value: f.id, label: f.name }))}
            />
            <DateRangePickerPlaceholder label="Expiry" />
          </div>
        }
        onClear={() => {
          setSearch("");
          setFacilityId(undefined);
        }}
      />

      <DataTable rows={rows} columns={cols} rowKey={(d) => d.id} />
    </div>
  );
}
