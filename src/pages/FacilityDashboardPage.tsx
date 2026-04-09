import * as React from "react";
import { useParams } from "react-router";
import { Droplets, FileText, Zap } from "lucide-react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  capas,
  chemicals,
  documents,
  getFacilityById,
  incidents,
  utilityRecords,
  wastewaterRecords,
  wasteRecords,
} from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ChartContainer } from "@/app/components/ui/chart";
import { PageHeader } from "@/components/PageHeader";
import { KPIStatCard } from "@/components/KPIStatCard";
import { RiskBadge } from "@/components/RiskBadge";
import { AuditScorePanel } from "@/components/AuditScorePanel";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatFacilityType, formatNumber } from "@/utils/format";

const facilityTrend = [
  { week: "W1", water: 7700, elec: 115_000, waste: 3_200 },
  { week: "W2", water: 8200, elec: 119_000, waste: 3_450 },
  { week: "W3", water: 7900, elec: 112_000, waste: 3_100 },
  { week: "W4", water: 8600, elec: 123_000, waste: 3_680 },
];

export function FacilityDashboardPage() {
  const { id } = useParams();
  const facility = id ? getFacilityById(id) : undefined;

  if (!facility) {
    return (
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Factory not found</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Unknown factory id.
        </CardContent>
      </Card>
    );
  }

  const facilityUtilities = utilityRecords.filter((u) => u.facilityId === facility.id);
  const facilityChemicals = chemicals.filter((c) => c.facilityId === facility.id);
  const facilityWaste = wasteRecords.filter((w) => w.facilityId === facility.id);
  const facilityWastewater = wastewaterRecords.filter((w) => w.facilityId === facility.id);
  const facilityCapas = capas.filter((c) => c.facilityId === facility.id);
  const facilityDocs = documents.filter((d) => d.facilityId === facility.id);
  const facilityIncidents = incidents.filter((i) => i.facilityId === facility.id);

  const water = facilityUtilities.find((u) => u.type === "water")?.value ?? 0;
  const electricity = facilityUtilities.find((u) => u.type === "electricity")?.value ?? 0;
  const hazardousChem = facilityChemicals.filter((c) => c.approvalStatus !== "approved").length;
  const wasteKg = facilityWaste.reduce((sum, w) => sum + w.qtyKg, 0);
  const openNonCompliance = facilityCapas.filter((c) => c.status !== "closed").length;
  const dueTests = facilityWastewater.some((r) => r.exceedance?.length) ? 1 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={facility.name}
        actions={
          <div className="flex items-center gap-2">
            <RiskBadge level={facility.riskLevel} />
            <AuditScorePanel score={facility.auditReadinessScore} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KPIStatCard title="Water consumption" value={`${formatNumber(water)} m³`} icon={Droplets} />
        <KPIStatCard title="Electricity consumption" value={`${formatNumber(electricity)} kWh`} icon={Zap} />
        <KPIStatCard title="Chemical stock risk" value={hazardousChem} helper="Restricted/pending chemicals" />
        <KPIStatCard title="Waste generated" value={`${formatNumber(wasteKg)} kg`} helper="Last logged period" />
        <KPIStatCard title="Open non-compliance" value={openNonCompliance} helper="Open/In progress/Overdue CAPA" />
        <KPIStatCard title="Due monitoring tests" value={dueTests} helper="Based on last lab schedule" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle>Utility trend</CardTitle>
            <div className="text-muted-foreground text-sm">Weekly trend (mock)</div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              className="h-[260px] w-full"
              config={{
                water: { label: "Water", color: "var(--chart-2)" },
                elec: { label: "Electricity", color: "var(--chart-1)" },
              }}
            >
              <ResponsiveContainer>
                <LineChart data={facilityTrend} margin={{ left: 6, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={56} />
                  <Tooltip />
                  <Line type="monotone" dataKey="elec" stroke="var(--color-elec)" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="water" stroke="var(--color-water)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle>Waste trend</CardTitle>
            <div className="text-muted-foreground text-sm">Weekly waste generated (mock)</div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer className="h-[260px] w-full" config={{ waste: { label: "Waste", color: "var(--chart-3)" } }}>
              <ResponsiveContainer>
                <LineChart data={facilityTrend} margin={{ left: 6, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={56} />
                  <Tooltip />
                  <Line type="monotone" dataKey="waste" stroke="var(--color-waste)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Wastewater summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {facilityWastewater.length ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-muted-foreground text-xs">Latest sample</div>
                    <div className="mt-1 text-sm font-medium">
                      {formatDate(facilityWastewater[0].sampleDate)} • {facilityWastewater[0].point}
                    </div>
                  </div>
                  <StatusBadge tone={facilityWastewater[0].exceedance?.length ? "critical" : "compliant"}>
                    {facilityWastewater[0].exceedance?.length ? "Exceedance" : "Within limits"}
                  </StatusBadge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs">pH</div>
                    <div className="mt-1 font-semibold">{facilityWastewater[0].pH}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs">COD</div>
                    <div className="mt-1 font-semibold">{facilityWastewater[0].COD} mg/L</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs">BOD</div>
                    <div className="mt-1 font-semibold">{facilityWastewater[0].BOD} mg/L</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs">TSS</div>
                    <div className="mt-1 font-semibold">{facilityWastewater[0].TSS} mg/L</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No wastewater records.</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Recent incidents</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {facilityIncidents.length ? (
                facilityIncidents.map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{i.title}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {formatDate(i.date)} • {i.type.replace(/_/g, " ")}
                      </div>
                    </div>
                    <StatusBadge tone={i.severity === "high" ? "critical" : i.severity === "medium" ? "warning" : "info"}>
                      {i.status}
                    </StatusBadge>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm">No incidents recorded.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Document expiry</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {facilityDocs.length ? (
                facilityDocs.map((d) => (
                  <div key={d.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{d.title}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        <FileText className="mr-1 inline size-3" />
                        {d.expiresOn ? `Expires ${formatDate(d.expiresOn)}` : "No expiry"}
                      </div>
                    </div>
                    <StatusBadge tone={d.status === "expired" ? "critical" : d.status === "expiring" ? "warning" : "compliant"}>
                      {d.status}
                    </StatusBadge>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm">No documents linked.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
