import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { FilterBar } from "@/components/FilterBar";
import { PageHeader } from "@/components/PageHeader";
import { ResponsiveWidgetGroup } from "@/components/ResponsiveWidgetGroup";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { TimelineList, type TimelineItem } from "@/components/TimelineList";
import { facilities, getFacilityName, wasteRecords } from "@/data/mock";
import { formatDate, formatNumber } from "@/utils/format";

import { getWasteColumns } from "./columns";
import { wasteTabs } from "./constants";
import { WasteCreateDialog } from "./components/WasteCreateDialog";
import { WasteKpis } from "./components/WasteKpis";
import { WasteSegregationCard } from "./components/WasteSegregationCard";

export function WastePage() {
  const [tab, setTab] = React.useState("generation");
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();

  const columns = React.useMemo(() => getWasteColumns(), []);

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

  const kpiHazBacklog = rows.filter(
    (w) => w.type === "hazardous" && w.disposalStatus !== "disposed",
  ).length;
  const kpiDueSoon = rows.filter(
    (w) =>
      w.dueBy && new Date(w.dueBy).getTime() <= new Date("2026-04-15").getTime(),
  ).length;
  const kpiTotalKg = rows.reduce((sum, w) => sum + w.qtyKg, 0);

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
        actions={
          <WasteCreateDialog
            facilities={facilities}
            facilityId={facilityId}
            onFacilityIdChange={setFacilityId}
          />
        }
      />

      <WasteKpis
        rowsCount={rows.length}
        totalKgLabel={`${formatNumber(kpiTotalKg)} kg`}
        hazardousBacklog={kpiHazBacklog}
        dueSoon={kpiDueSoon}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {wasteTabs.map((t) => (
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
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search waste stream / vendor…"
                  />
                </div>
                <SelectFilter
                  value={facilityId}
                  onChange={setFacilityId}
                  placeholder="Company"
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

            <ResponsiveWidgetGroup
              desktopClassName="grid gap-4"
              mobileItemClassName="w-[min(92vw,520px)]"
              items={[
                { key: "timeline", node: <TimelineList title="Disposal timeline" items={disposalTimeline} /> },
                { key: "segregation", node: <WasteSegregationCard /> },
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
