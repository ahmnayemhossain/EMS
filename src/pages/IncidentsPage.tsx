import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { facilities, getFacilityName, incidents } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
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
  const [factoryId, setFactoryId] = React.useState<string | undefined>();

  const [incidentRows, setIncidentRows] = React.useState<Incident[]>(() => incidents);
  const [incidentCreateOpen, setIncidentCreateOpen] = React.useState(false);
  const [incidentDraft, setIncidentDraft] = React.useState<{
    facilityId?: string;
    date: string;
    title: string;
    type: Incident["type"];
    severity: Incident["severity"];
  }>(() => ({
    facilityId: facilities[0]?.id,
    date: new Date().toISOString().slice(0, 10),
    title: "",
    type: "near_miss",
    severity: "low",
  }));

  const rowsFiltered = incidentRows
    .filter((i) => (factoryId ? i.facilityId === factoryId : true))
    .filter((i) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
      );
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
    },
    {
      id: "type",
      header: "Type",
      cell: (i) => <StatusBadge tone="info">{i.type.replace(/_/g, " ")}</StatusBadge>,
      className: "whitespace-nowrap",
    },
    {
      id: "severity",
      header: "Severity",
      cell: (i) => (
        <StatusBadge
          tone={
            i.severity === "high"
              ? "critical"
              : i.severity === "medium"
                ? "warning"
                : "neutral"
          }
        >
          {i.severity}
        </StatusBadge>
      ),
      className: "whitespace-nowrap",
    },
    {
      id: "status",
      header: "Status",
      cell: (i) => (
        <StatusBadge
          tone={
            i.status === "closed"
              ? "compliant"
              : i.status === "investigating"
                ? "warning"
                : "info"
          }
        >
          {i.status}
        </StatusBadge>
      ),
      className: "whitespace-nowrap",
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
      className: "text-right whitespace-nowrap",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" onClick={() => setIncidentCreateOpen(true)}>
          <TriangleAlert className="mr-2 size-4" />
          Create
        </Button>
      </div>

      <FilterBar
        left={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search incidents..." />
            </div>
            <SelectFilter
              value={factoryId}
              onChange={setFactoryId}
              placeholder="Factory"
              items={facilities.map((f) => ({ value: f.id, label: f.name }))}
            />
            <DateRangePickerPlaceholder label="Date" />
          </div>
        }
        onClear={() => {
          setSearch("");
          setFactoryId(undefined);
        }}
      />

      <DataTable rows={rowsFiltered} columns={cols} rowKey={(r) => r.id} />

      <Dialog open={incidentCreateOpen} onOpenChange={setIncidentCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create incident</DialogTitle>
            <DialogDescription>Log an environmental / safety incident.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">Factory</div>
              <Select
                value={incidentDraft.facilityId || ""}
                onValueChange={(v) => setIncidentDraft((d) => ({ ...d, facilityId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select factory" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">Date</div>
              <Input
                type="date"
                value={incidentDraft.date}
                onChange={(e) => setIncidentDraft((d) => ({ ...d, date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-muted-foreground text-xs">Type</div>
                <Select
                  value={incidentDraft.type}
                  onValueChange={(v) =>
                    setIncidentDraft((d) => ({ ...d, type: v as Incident["type"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spill">spill</SelectItem>
                    <SelectItem value="chemical_exposure">chemical exposure</SelectItem>
                    <SelectItem value="wastewater_exceedance">wastewater exceedance</SelectItem>
                    <SelectItem value="fire">fire</SelectItem>
                    <SelectItem value="near_miss">near miss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="text-muted-foreground text-xs">Severity</div>
                <Select
                  value={incidentDraft.severity}
                  onValueChange={(v) =>
                    setIncidentDraft((d) => ({
                      ...d,
                      severity: v as Incident["severity"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">Title</div>
              <Input
                value={incidentDraft.title}
                onChange={(e) =>
                  setIncidentDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder="Write a short incident title..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!incidentDraft.facilityId || !incidentDraft.date || !incidentDraft.title.trim()) return;
                setIncidentRows((prev) => [
                  {
                    id: `inc_local_${Date.now()}`,
                    facilityId: incidentDraft.facilityId,
                    date: incidentDraft.date,
                    title: incidentDraft.title.trim(),
                    type: incidentDraft.type,
                    severity: incidentDraft.severity,
                    status: "open",
                  },
                  ...prev,
                ]);
                setIncidentDraft((d) => ({ ...d, title: "" }));
                setIncidentCreateOpen(false);
              }}
              disabled={!incidentDraft.facilityId || !incidentDraft.date || !incidentDraft.title.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

