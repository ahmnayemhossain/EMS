import * as React from "react";
import { GraduationCap } from "lucide-react";

import { facilities, getFacilityName, trainingRecords } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/format";
import type { TrainingRecord } from "@/types/ems";

export function TrainingPage() {
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();

  const rows = trainingRecords
    .filter((t) => (facilityId ? t.facilityId === facilityId : true))
    .filter((t) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.audience.toLowerCase().includes(q);
    });

  const cols: Array<DataColumn<TrainingRecord>> = [
    {
      id: "training",
      header: "Training",
      cell: (t) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{t.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {t.audience} • {getFacilityName(t.facilityId)}
          </div>
        </div>
      ),
      className: "min-w-[420px]",
    },
    {
      id: "completed",
      header: "Completed",
      cell: (t) => <div className="text-sm">{formatDate(t.completedOn)}</div>,
      className: "min-w-[160px]",
    },
    {
      id: "next",
      header: "Next due",
      cell: (t) => <div className="text-sm">{t.nextDueOn ? formatDate(t.nextDueOn) : "—"}</div>,
      className: "min-w-[160px]",
    },
    {
      id: "status",
      header: "Status",
      cell: (t) => (
        <StatusBadge tone={t.status === "complete" ? "compliant" : t.status === "due_soon" ? "warning" : "critical"}>
          {t.status.replace(/_/g, " ")}
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
        title="Training"
        actions={
          <Button variant="outline">
            <GraduationCap className="mr-2 size-4" />
            Add training
          </Button>
        }
      />

      <FilterBar
        left={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search trainings…" />
            </div>
            <SelectFilter
              value={facilityId}
              onChange={setFacilityId}
              placeholder="Factory"
              items={facilities.map((f) => ({ value: f.id, label: f.name }))}
            />
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
