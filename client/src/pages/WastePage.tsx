import * as React from "react";
import { Link } from "react-router";
import { CalendarClock, Recycle, Truck } from "lucide-react";

import { wasteRecords, facilities, getFacilityName } from "@/data/mock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { KPIStatCard } from "@/components/KPIStatCard";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { TimelineList, type TimelineItem } from "@/components/TimelineList";
import { formatDate, formatNumber } from "@/utils/format";
import type { WasteRecord, WasteType } from "@/types/ems";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";

const tabs: Array<{ value: string; label: string }> = [
  { value: "generation", label: "Generation Log" },
  { value: "storage", label: "Storage" },
  { value: "disposal", label: "Disposal" },
  { value: "sludge", label: "Sludge" },
  { value: "vendors", label: "Vendors" },
  { value: "reports", label: "Reports" },
];

function toneForWasteType(type: WasteType) {
  if (type === "hazardous" || type === "sludge") return "warning";
  if (type === "e_waste") return "info";
  return "compliant";
}

export function WastePage() {
  const [tab, setTab] = React.useState("generation");
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();
  const rows = wasteRecords
    .filter((w) => (facilityId ? w.facilityId === facilityId : true))
    .filter((w) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        w.stream.toLowerCase().includes(q) ||
        w.storageLocation.toLowerCase().includes(q) ||
        (w.vendor ?? "").toLowerCase().includes(q) ||
        getFacilityName(w.facilityId).toLowerCase().includes(q)
      );
    });

  const kpiHazBacklog = rows.filter((w) => w.type === "hazardous" && w.disposalStatus !== "disposed").length;
  const kpiDueSoon = rows.filter((w) => w.dueBy && new Date(w.dueBy).getTime() <= new Date("2026-04-15").getTime()).length;
  const kpiTotalKg = rows.reduce((sum, w) => sum + w.qtyKg, 0);

  const columns: Array<DataColumn<WasteRecord>> = [
    {
      id: "stream",
      header: "Waste stream",
      cell: (w) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{w.stream}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(w.facilityId)} • {w.storageLocation}
          </div>
        </div>
      ),
      className: "min-w-[340px]",
    },
    {
      id: "type",
      header: "Type",
      cell: (w) => <StatusBadge tone={toneForWasteType(w.type)}>{w.type.replace(/_/g, " ")}</StatusBadge>,
      className: "min-w-[160px]",
    },
    {
      id: "qty",
      header: "Qty",
      cell: (w) => (
        <div className="text-right font-medium tabular-nums">{formatNumber(w.qtyKg)} kg</div>
      ),
      className: "text-right min-w-[120px]",
    },
    {
      id: "status",
      header: "Disposal",
      cell: (w) => (
        <div className="flex justify-end">
          <StatusBadge tone={w.disposalStatus === "disposed" ? "compliant" : w.disposalStatus === "scheduled" ? "warning" : "critical"}>
            {w.disposalStatus}
          </StatusBadge>
        </div>
      ),
      className: "text-right min-w-[140px]",
    },
    {
      id: "due",
      header: "Due by",
      cell: (w) => (
        <div className="flex justify-end">
          <StatusBadge tone={w.dueBy ? "warning" : "neutral"}>{w.dueBy ? formatDate(w.dueBy) : "—"}</StatusBadge>
        </div>
      ),
      className: "text-right min-w-[140px]",
    },
  ];

  const disposalTimeline: TimelineItem[] = rows
    .filter((w) => w.disposalStatus !== "disposed")
    .map((w) => ({
      id: w.id,
      title: `${w.stream} • ${formatNumber(w.qtyKg)} kg`,
      date: w.dueBy ? `Due ${formatDate(w.dueBy)}` : `Logged ${formatDate(w.date)}`,
      description: `${getFacilityName(w.facilityId)} • ${w.vendor ?? "Vendor not assigned"}`,
      tone: w.type === "hazardous" ? "warning" : "info",
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waste management"
        actions={
          <CreateActionDialog title="Create waste log">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Factory</div>
                <SelectFilter
                  value={facilityId}
                  onChange={setFacilityId}
                  placeholder="Select factory"
                  items={facilities.map((f) => ({ value: f.id, label: f.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Date</div>
                <Input type="date" />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Waste stream</div>
                <Input placeholder="e.g. ETP Sludge / Used solvent" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Type</div>
                <SelectFilter
                  value={undefined}
                  onChange={(value) => {
                    void value;
                  }}
                  placeholder="Select type"
                  items={[
                    { value: "hazardous", label: "Hazardous" },
                    { value: "non_hazardous", label: "Non-hazardous" },
                    { value: "recyclable", label: "Recyclable" },
                    { value: "sludge", label: "Sludge" },
                    { value: "e_waste", label: "E-waste" },
                  ]}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Qty (kg)</div>
                <Input type="number" placeholder="0" />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Storage location</div>
                <Input placeholder="e.g. Haz waste store / Sludge yard" />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Notes</div>
                <Textarea placeholder="Optional notes" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                <div className="text-sm font-medium">Reports</div>
                <Button asChild type="button" variant="outline" size="sm">
                  <Link to="/reports">
                    <Truck className="mr-2 size-4" />
                    Disposal reports
                  </Link>
                </Button>
              </div>
            </div>
          </CreateActionDialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard title="Waste logged" value={rows.length} icon={Recycle} tone="info" />
        <KPIStatCard title="Total quantity" value={`${formatNumber(kpiTotalKg)} kg`} tone="info" />
        <KPIStatCard title="Hazardous backlog" value={kpiHazBacklog} helper="Not disposed yet" tone={kpiHazBacklog > 0 ? "warning" : "compliant"} />
        <KPIStatCard title="Due soon" value={kpiDueSoon} helper="Before Apr 15, 2026 (mock)" icon={CalendarClock} tone={kpiDueSoon > 0 ? "warning" : "compliant"} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-4">
          <FilterBar
            left={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-[320px]">
                  <SearchInput value={search} onChange={setSearch} placeholder="Search waste stream / vendor…" />
                </div>
                <SelectFilter
                  value={facilityId}
                  onChange={setFacilityId}
                  placeholder="Factory"
                  items={facilities.map((f) => ({ value: f.id, label: f.name }))}
                />
                <DateRangePickerPlaceholder label="Log date" />
              </div>
            }
            onClear={() => {
              setSearch("");
              setFacilityId(undefined);
            }}
            right={<Button variant="outline">Add log</Button>}
          />

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="shadow-xs xl:col-span-2">
              <CardHeader>
                <CardTitle>Waste table</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <DataTable rows={rows} columns={columns} rowKey={(w) => w.id} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <TimelineList title="Disposal timeline" items={disposalTimeline} />
              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle>Segregation status</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Hazardous labeled</span>
                      <StatusBadge tone="warning">Partial</StatusBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Recyclables separated</span>
                      <StatusBadge tone="compliant">Good</StatusBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Storage area housekeeping</span>
                      <StatusBadge tone="info">Monitor</StatusBadge>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Widget placeholder; wire to inspection checklist later.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
