import * as React from "react";
import { Droplets, FlaskConical, Link2, TriangleAlert } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { capas, getFacilityName, wastewaterRecords } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ChartContainer } from "@/app/components/ui/chart";
import { PageHeader } from "@/components/PageHeader";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { KPIStatCard } from "@/components/KPIStatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { formatDate } from "@/utils/format";
import type { WastewaterRecord } from "@/types/ems";
import { Input } from "@/app/components/ui/input";
import { SelectFilter } from "@/components/SelectFilter";

const thresholds = {
  pH: { min: 6.0, max: 9.0 },
  COD: { max: 250 },
  BOD: { max: 80 },
};

export function WastewaterPage() {
  const latest = wastewaterRecords[0];
  const exceedances = wastewaterRecords.filter((r) => r.exceedance?.length).length;

  const trend = [...wastewaterRecords]
    .slice()
    .reverse()
    .map((r) => ({
      date: formatDate(r.sampleDate),
      pH: r.pH,
      COD: r.COD,
      BOD: r.BOD,
    }));

  const cols: Array<DataColumn<WastewaterRecord>> = [
    {
      id: "factory",
      header: "Factory",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{getFacilityName(r.facilityId)}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {formatDate(r.sampleDate)} • {r.point}
          </div>
        </div>
      ),
      className: "min-w-[320px]",
    },
    {
      id: "ph",
      header: "pH",
      cell: (r) => (
        <StatusBadge tone={r.pH > thresholds.pH.max || r.pH < thresholds.pH.min ? "critical" : "compliant"}>
          {r.pH}
        </StatusBadge>
      ),
    },
    {
      id: "cod",
      header: "COD (mg/L)",
      cell: (r) => (
        <StatusBadge tone={r.COD > thresholds.COD.max ? "critical" : "neutral"}>
          {r.COD}
        </StatusBadge>
      ),
    },
    {
      id: "bod",
      header: "BOD (mg/L)",
      cell: (r) => (
        <StatusBadge tone={r.BOD > thresholds.BOD.max ? "warning" : "neutral"}>
          {r.BOD}
        </StatusBadge>
      ),
    },
    {
      id: "report",
      header: "Lab report",
      cell: (r) =>
        r.labReport ? (
          <div className="text-muted-foreground text-sm">{r.labReport.fileName}</div>
        ) : (
          <StatusBadge tone="warning">Missing</StatusBadge>
        ),
      className: "min-w-[220px]",
    },
  ];

  const linkedCapas = capas.filter((c) => c.title.toLowerCase().includes("etp") || c.title.toLowerCase().includes("wastewater"));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wastewater / ETP monitoring"
        actions={
          <CreateActionDialog title="Create lab record">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Sample date</div>
                <Input type="date" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Point</div>
                <SelectFilter
                  value={undefined}
                  onChange={(value) => {
                    void value;
                  }}
                  placeholder="Select point"
                  items={[
                    { value: "inlet", label: "Inlet" },
                    { value: "outlet", label: "Outlet" },
                  ]}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">pH</div>
                <Input type="number" placeholder="0" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">COD</div>
                <Input type="number" placeholder="0" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">BOD</div>
                <Input type="number" placeholder="0" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">TSS</div>
                <Input type="number" placeholder="0" />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Lab report</div>
                <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                  Upload report file (placeholder)
                </div>
              </div>
            </div>
          </CreateActionDialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KPIStatCard title="Inflow" value="—" helper="Add flow meters later" icon={Droplets} />
        <KPIStatCard title="Outflow" value="—" helper="Add outflow meter later" icon={Droplets} />
        <KPIStatCard title="Latest pH" value={latest ? latest.pH : "—"} helper={latest ? formatDate(latest.sampleDate) : ""} />
        <KPIStatCard title="Latest COD" value={latest ? `${latest.COD} mg/L` : "—"} helper="Outlet sample" />
        <KPIStatCard title="Latest BOD" value={latest ? `${latest.BOD} mg/L` : "—"} helper="Outlet sample" />
        <KPIStatCard
          title="Exceedance count"
          value={exceedances}
          helper="Records flagged"
          tone={exceedances > 0 ? "critical" : "compliant"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-xs xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Trends</CardTitle>
            <div className="text-muted-foreground text-sm">pH, COD and BOD (mock records)</div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              className="h-[280px] w-full"
              config={{
                pH: { label: "pH", color: "var(--chart-2)" },
                COD: { label: "COD", color: "var(--chart-4)" },
                BOD: { label: "BOD", color: "var(--chart-3)" },
              }}
            >
              <ResponsiveContainer>
                <LineChart data={trend} margin={{ left: 6, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={56} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pH" stroke="var(--color-pH)" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="COD" stroke="var(--color-COD)" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="BOD" stroke="var(--color-BOD)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>pH</span>
                <StatusBadge tone="neutral">
                  {thresholds.pH.min}–{thresholds.pH.max}
                </StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span>COD</span>
                <StatusBadge tone="neutral">≤ {thresholds.COD.max} mg/L</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span>BOD</span>
                <StatusBadge tone="neutral">≤ {thresholds.BOD.max} mg/L</StatusBadge>
              </div>
              <div className="text-muted-foreground text-xs">
                Threshold panel placeholder; make factory-specific later.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-xs xl:col-span-2">
          <CardHeader>
            <CardTitle>Lab reports</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable
              rows={wastewaterRecords}
              columns={cols}
              rowKey={(r) => r.id}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Sludge generation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border p-4">
                <div className="text-muted-foreground text-xs">This month (mock)</div>
                <div className="mt-1 text-xl font-semibold">8,200 kg</div>
                <div className="text-muted-foreground mt-2 text-sm">
                  Link to disposal logs in Waste module.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="size-4" />
                Linked CAPA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {linkedCapas.map((c) => (
                  <div key={c.id} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{c.title}</div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          {getFacilityName(c.facilityId)} • Due {formatDate(c.dueDate)}
                        </div>
                      </div>
                      <StatusBadge tone={c.status === "overdue" ? "critical" : c.status === "open" ? "warning" : "info"}>
                        {c.status}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
                {!linkedCapas.length ? <div className="text-muted-foreground text-sm">No linked CAPA.</div> : null}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="size-4" />
                Dosing log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-muted-foreground text-sm">
                Placeholder for daily dosing inputs, chemical consumption, and operator sign-off.
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border p-3">
                <div className="text-sm font-medium">Today</div>
                <StatusBadge tone="warning">
                  <TriangleAlert className="size-3" />
                  Pending entry
                </StatusBadge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
