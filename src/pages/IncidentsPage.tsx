import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { facilities, getFacilityName, incidents } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/format";
import type { Incident } from "@/types/ems";

export function IncidentsPage() {
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();

  const rows = incidents
    .filter((i) => (facilityId ? i.facilityId === facilityId : true))
    .filter((i) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q);
    });

  const cols: Array<DataColumn<Incident>> = [
    {
      id: "incident",
      header: "Incident",
      cell: (i) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{i.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(i.facilityId)} • {formatDate(i.date)}
          </div>
        </div>
      ),
      className: "min-w-[420px]",
    },
    {
      id: "type",
      header: "Type",
      cell: (i) => <StatusBadge tone="info">{i.type.replace(/_/g, " ")}</StatusBadge>,
      className: "min-w-[200px]",
    },
    {
      id: "severity",
      header: "Severity",
      cell: (i) => (
        <StatusBadge tone={i.severity === "high" ? "critical" : i.severity === "medium" ? "warning" : "neutral"}>
          {i.severity}
        </StatusBadge>
      ),
      className: "min-w-[140px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (i) => (
        <StatusBadge tone={i.status === "closed" ? "compliant" : i.status === "investigating" ? "warning" : "info"}>
          {i.status}
        </StatusBadge>
      ),
      className: "min-w-[160px]",
    },
    {
      id: "action",
      header: "",
      cell: () => (
        <div className="text-right">
          <Button size="sm" variant="outline">
            Open
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incidents"
        actions={
          <Button variant="outline">
            <TriangleAlert className="mr-2 size-4" />
            Log incident
          </Button>
        }
      />

      <FilterBar
        left={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search incidents…" />
            </div>
            <SelectFilter
              value={facilityId}
              onChange={setFacilityId}
              placeholder="Factory"
              items={facilities.map((f) => ({ value: f.id, label: f.name }))}
            />
            <DateRangePickerPlaceholder label="Date" />
          </div>
        }
        onClear={() => {
          setSearch("");
          setFacilityId(undefined);
        }}
      />

      <DataTable rows={rows} columns={cols} rowKey={(r) => r.id} />
    </div>
  );
}
