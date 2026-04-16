import * as React from "react";
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { facilities, getFacilityName, utilityRecords } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card, CardContent } from "@/app/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { KPIStatCard } from "@/components/KPIStatCard";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { ChartContainer } from "@/app/components/ui/chart";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatNumber, formatUtilityType } from "@/utils/format";
import type { UtilityRecord, UtilityType } from "@/types/ems";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { useSelectedFactory } from "@/app/state/factory";

const utilityTypes: UtilityType[] = [
  "electricity",
  "water",
  "fuel",
  "steam",
  "refrigerant",
  "other",
];

const trendMock = [
  { label: "Jan", value: 120 },
  { label: "Feb", value: 108 },
  { label: "Mar", value: 126 },
  { label: "Apr", value: 118 },
  { label: "May", value: 132 },
  { label: "Jun", value: 125 },
];

export function UtilitiesPage() {
  const [active, setActive] = React.useState<UtilityType>("electricity");
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<UtilityRecord | null>(null);

  const { selectedFactoryId } = useSelectedFactory();
  const [createFactoryId, setCreateFactoryId] = React.useState<string>(selectedFactoryId);
  const [createType, setCreateType] = React.useState<UtilityType>(active);
  const [createMeterName, setCreateMeterName] = React.useState("");
  const [createPeriodStart, setCreatePeriodStart] = React.useState("");
  const [createPeriodEnd, setCreatePeriodEnd] = React.useState("");
  const [createValue, setCreateValue] = React.useState("");
  const [createUnit, setCreateUnit] = React.useState("");
  const [createMin, setCreateMin] = React.useState("");
  const [createRemarks, setCreateRemarks] = React.useState("");

  const createValueNum =
    createValue.trim() === "" ? undefined : Number(createValue);
  const createMinNum = createMin.trim() === "" ? undefined : Number(createMin);
  const isBelowMin =
    typeof createValueNum === "number" &&
    !Number.isNaN(createValueNum) &&
    typeof createMinNum === "number" &&
    !Number.isNaN(createMinNum) &&
    createValueNum < createMinNum;

  const rows = utilityRecords
    .filter((r) => r.type === active)
    .filter((r) => (facilityId ? r.facilityId === facilityId : true))
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        r.meterName.toLowerCase().includes(q) ||
        getFacilityName(r.facilityId).toLowerCase().includes(q)
      );
    });

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const flagged = rows.filter((r) => r.varianceFlag === "high").length;

  const cols: Array<DataColumn<UtilityRecord>> = [
    {
      id: "factory",
      header: "Factory",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{getFacilityName(r.facilityId)}</div>
          <div className="text-muted-foreground mt-1 text-xs">{r.meterName}</div>
        </div>
      ),
      className: "min-w-[320px]",
    },
    {
      id: "period",
      header: "Period",
      cell: (r) => (
        <div className="text-sm">
          <div>{formatDate(r.periodStart)} → {formatDate(r.periodEnd)}</div>
          <div className="text-muted-foreground mt-1 text-xs">{formatUtilityType(r.type)}</div>
        </div>
      ),
      className: "min-w-[220px]",
    },
    {
      id: "value",
      header: "Reading",
      cell: (r) => (
        <div className="text-right font-medium tabular-nums">
          {formatNumber(r.value)} {r.uom}
        </div>
      ),
      className: "text-right min-w-[160px]",
    },
    {
      id: "variance",
      header: "Variance",
      cell: (r) => {
        const tone =
          r.varianceFlag === "high"
            ? "critical"
            : r.varianceFlag === "watch"
              ? "warning"
              : "compliant";
        return (
          <div className="flex justify-end">
            <StatusBadge tone={tone}>{r.varianceFlag ?? "normal"}</StatusBadge>
          </div>
        );
      },
      className: "text-right min-w-[140px]",
    },
    {
      id: "action",
      header: "",
      cell: () => (
        <div className="text-right">
          <Button variant="outline" size="sm">
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
        title="Utilities"
        actions={
          <CreateActionDialog
            title="Create utility record"
            submitDisabled={isBelowMin}
            onCreate={() => {
              if (isBelowMin) return false;
              // Mock-only: no persistence yet.
              return true;
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Factory</div>
                <SelectFilter
                  value={createFactoryId}
                  onChange={setCreateFactoryId}
                  placeholder="Select factory"
                  items={facilities.map((f) => ({ value: f.id, label: f.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Type</div>
                <SelectFilter
                  value={createType}
                  onChange={(v) => setCreateType(v as UtilityType)}
                  placeholder="Utility type"
                  items={utilityTypes.map((t) => ({
                    value: t,
                    label: formatUtilityType(t),
                  }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Period start</div>
                <Input
                  type="date"
                  value={createPeriodStart}
                  onChange={(e) => setCreatePeriodStart(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Period end</div>
                <Input
                  type="date"
                  value={createPeriodEnd}
                  onChange={(e) => setCreatePeriodEnd(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Meter name</div>
                <Input
                  value={createMeterName}
                  onChange={(e) => setCreateMeterName(e.target.value)}
                  placeholder="e.g. Main incomer"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Value</div>
                <Input
                  type="number"
                  value={createValue}
                  onChange={(e) => setCreateValue(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Unit</div>
                <Input
                  value={createUnit}
                  onChange={(e) => setCreateUnit(e.target.value)}
                  placeholder="kWh / m³ / L"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">
                  Minimum threshold (alert below)
                </div>
                <Input
                  type="number"
                  value={createMin}
                  onChange={(e) => setCreateMin(e.target.value)}
                  placeholder="e.g. 1000"
                />
                {isBelowMin ? (
                  <Alert variant="destructive">
                    <TriangleAlert />
                    <AlertTitle>Below minimum threshold</AlertTitle>
                    <AlertDescription>
                      Value ({createValueNum}) is below minimum ({createMinNum}). Please correct before creating.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Remarks</div>
                <Textarea
                  value={createRemarks}
                  onChange={(e) => setCreateRemarks(e.target.value)}
                  placeholder="Optional remarks"
                />
              </div>
            </div>
          </CreateActionDialog>
        }
      />

      <Tabs value={active} onValueChange={(v) => setActive(v as UtilityType)}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {utilityTypes.map((t) => (
            <TabsTrigger key={t} value={t}>
              {formatUtilityType(t)}
            </TabsTrigger>
          ))}
        </TabsList>

        {utilityTypes.map((t) => (
          <TabsContent key={t} value={t} className="mt-4 space-y-4">
            <FilterBar
              left={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="w-full sm:w-[320px]">
                  <SearchInput
                      value={search}
                      onChange={setSearch}
                      placeholder="Search meter / factory…"
                    />
                  </div>
                  <SelectFilter
                    value={facilityId}
                    onChange={setFacilityId}
                    placeholder="Factory"
                    items={facilities.map((f) => ({ value: f.id, label: f.name }))}
                  />
                  <DateRangePickerPlaceholder />
                </div>
              }
              onClear={() => {
                setSearch("");
                setFacilityId(undefined);
              }}
              right={<Button variant="outline">Import bills</Button>}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KPIStatCard title="Records" value={rows.length} tone="neutral" />
              <KPIStatCard title="Total" value={formatNumber(total)} helper="Sum of selected records" tone="info" />
              <KPIStatCard title="High variance" value={flagged} helper="Requires review" tone={flagged > 0 ? "warning" : "compliant"} />
              <KPIStatCard title="Missing bills" value={rows.filter((r) => !(r.billFiles?.length)).length} helper="Attach bill files" tone={rows.some((r) => !(r.billFiles?.length)) ? "warning" : "compliant"} />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="shadow-xs xl:col-span-2">
                <CardContent className="pt-6">
                  <ChartContainer className="h-[260px] w-full" config={{ value: { label: "Value", color: "var(--chart-2)" } }}>
                    <ResponsiveContainer>
                      <AreaChart data={trendMock} margin={{ left: 6, right: 10, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={56} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="color-mix(in oklab, var(--color-value) 15%, transparent)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="text-muted-foreground mt-2 text-xs">
                    Trend chart placeholder; wire to real time-series later.
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xs">
                <CardContent className="pt-6">
                  <div className="text-sm font-semibold">Comparison widget</div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Compare factory meters vs baseline (placeholder).
                  </div>
                  <div className="mt-4 grid gap-2">
                    <div className="rounded-lg border p-3 text-sm">
                      <div className="text-muted-foreground text-xs">Top variance</div>
                      <div className="mt-1 font-medium">Process water line (GS-D)</div>
                    </div>
                    <div className="rounded-lg border p-3 text-sm">
                      <div className="text-muted-foreground text-xs">Stable meters</div>
                      <div className="mt-1 font-medium">Production floor (GS-S)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">Utility records</div>
              <DataTable
                rows={rows}
                columns={cols}
                rowKey={(r) => r.id}
                onRowClick={(r) => setSelected(r)}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `${formatUtilityType(selected.type)} — ${selected.meterName}` : "Utility record"}
        description={selected ? `${getFacilityName(selected.facilityId)} • ${formatDate(selected.periodStart)} to ${formatDate(selected.periodEnd)}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Value</div>
                <div className="mt-1 text-sm font-semibold">
                  {formatNumber(selected.value)} {selected.uom}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Variance</div>
                <div className="mt-1">
                  <StatusBadge
                    tone={
                      selected.varianceFlag === "high"
                        ? "critical"
                        : selected.varianceFlag === "watch"
                          ? "warning"
                          : "compliant"
                    }
                  >
                    {selected.varianceFlag ?? "normal"}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground text-xs">Remarks</div>
              <div className="mt-1 text-sm">
                {selected.remarks ?? "—"}
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground text-xs">Bill uploads</div>
              <div className="mt-2 space-y-2 text-sm">
                {selected.billFiles?.length ? (
                  selected.billFiles.map((b) => (
                    <div key={b.name} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 truncate">{b.name}</div>
                      <div className="text-muted-foreground shrink-0 text-xs">
                        {formatDate(b.uploadedAt)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-sm">No files attached.</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground text-xs">Meter history</div>
              <div className="text-muted-foreground mt-1 text-sm">
                Placeholder for per-meter ledger and variance explanation.
              </div>
            </div>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}
