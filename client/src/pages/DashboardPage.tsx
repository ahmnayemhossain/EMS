import * as React from "react";
import { Link } from "react-router";
import { CalendarDays, FileText, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  audits,
  capas,
  chemicals,
  documents,
  facilities,
  notifications,
  utilityRecords,
} from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ChartContainer } from "@/app/components/ui/chart";
import { PageHeader } from "@/components/PageHeader";
import { KPIStatCard } from "@/components/KPIStatCard";
import { AlertCard } from "@/components/AlertCard";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ActivityList } from "@/components/ActivityList";
import { TimelineList } from "@/components/TimelineList";
import { formatDate, formatNumber } from "@/utils/format";

const utilityTrend = [
  { month: "Nov", kwh: 780_000 },
  { month: "Dec", kwh: 812_000 },
  { month: "Jan", kwh: 835_000 },
  { month: "Feb", kwh: 805_000 },
  { month: "Mar", kwh: 820_000 },
  { month: "Apr", kwh: 790_000 },
];

export function DashboardPage() {
  const avgReadiness = Math.round(
    facilities.reduce((sum, f) => sum + f.auditReadinessScore, 0) / facilities.length,
  );
  const openCapa = capas.filter((c) => c.status !== "closed").length;
  const expiredDocs = documents.filter((d) => d.status === "expired").length;
  const chemicalAlerts = chemicals.filter((c) => c.approvalStatus !== "approved").length;
  const wasteDisposalPending = 3;
  const varianceFlags = utilityRecords.filter((r) => r.varianceFlag === "high").length;

  const readinessTone =
    avgReadiness >= 85 ? "compliant" : avgReadiness >= 70 ? "warning" : "critical";

  const facilityColumns: Array<DataColumn<(typeof facilities)[number]>> = [
    {
      id: "factory",
      header: "Factory",
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.name}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {row.location.city} • {row.code}
          </div>
        </div>
      ),
      className: "min-w-[340px]",
    },
    {
      id: "risk",
      header: "Risk",
      cell: (row) => <RiskBadge level={row.riskLevel} />,
    },
    {
      id: "readiness",
      header: "Audit readiness",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge
            tone={
              row.auditReadinessScore >= 85
                ? "compliant"
                : row.auditReadinessScore >= 70
                  ? "warning"
                  : "critical"
            }
          >
            {row.auditReadinessScore}%
          </StatusBadge>
        </div>
      ),
    },
    {
      id: "compliance",
      header: "Compliance",
      cell: (row) => (
        <StatusBadge
          tone={row.complianceScore >= 85 ? "compliant" : row.complianceScore >= 70 ? "warning" : "critical"}
        >
          {row.complianceScore}%
        </StatusBadge>
      ),
    },
    {
      id: "action",
      header: "",
      cell: (row) => (
        <Button asChild variant="outline" size="sm">
          <Link to={`/factories/${row.id}`}>Open</Link>
        </Button>
      ),
      className: "text-right",
    },
  ];

  const overdueCapas = capas.filter((c) => c.status === "overdue");
  const expiringPermits = documents.filter((d) => d.status !== "valid");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Group dashboard"
        actions={
          <Button variant="outline">
            <FileText className="mr-2 size-4" />
            Generate report
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KPIStatCard
          title="Audit Readiness Score"
          value={`${avgReadiness}%`}
          helper="Weighted across active factories"
          icon={ShieldCheck}
          tone={readinessTone}
        />
        <KPIStatCard
          title="Open CAPA"
          value={openCapa}
          helper="All statuses except closed"
          tone={openCapa > 0 ? "warning" : "compliant"}
        />
        <KPIStatCard
          title="Expired Documents"
          value={expiredDocs}
          helper="Requires renewal / upload"
          tone={expiredDocs > 0 ? "critical" : "compliant"}
        />
        <KPIStatCard
          title="Chemical Alerts"
          value={chemicalAlerts}
          helper="Restricted or pending approvals"
          tone={chemicalAlerts > 0 ? "warning" : "compliant"}
        />
        <KPIStatCard
          title="Waste Disposal Pending"
          value={wasteDisposalPending}
          helper="Stored / scheduled streams"
          tone={wasteDisposalPending > 0 ? "warning" : "compliant"}
        />
        <KPIStatCard
          title="Utility Variance Flags"
          value={varianceFlags}
          helper="High variance vs baseline"
          tone={varianceFlags > 0 ? "info" : "compliant"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-xs xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Group utility trend</CardTitle>
                <div className="text-muted-foreground mt-1 text-sm">
                  Electricity consumption (kWh), last 6 months (mocked)
                </div>
              </div>
              <StatusBadge tone="info">
                <CalendarDays className="size-3" />
                Rolling 6 months
              </StatusBadge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              className="h-[260px] w-full"
              config={{ kwh: { label: "kWh", color: "var(--chart-2)" } }}
            >
              <ResponsiveContainer>
                <AreaChart data={utilityTrend} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={56} />
                  <Tooltip
                    formatter={(v: number) => [formatNumber(v), "kWh"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="kwh"
                    stroke="var(--color-kwh)"
                    fill="color-mix(in oklab, var(--color-kwh) 15%, transparent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle>Compliance alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {notifications.slice(0, 3).map((n) => (
                <AlertCard
                  key={n.id}
                  tone={n.tone}
                  title={n.title}
                  description={n.description}
                  meta={<div className="text-muted-foreground text-xs">{n.createdAt}</div>}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle>Audit calendar</CardTitle>
              <div className="text-muted-foreground text-sm">Placeholder widget</div>
            </CardHeader>
            <CardContent className="pt-0">
              <Calendar mode="single" selected={new Date(audits[0]?.date ?? Date.now())} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Factory performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            rows={facilities}
            columns={facilityColumns}
            rowKey={(r) => r.id}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <TimelineList
          title="Overdue actions"
          items={overdueCapas.map((c) => ({
            id: c.id,
            title: c.title,
            date: `Due ${formatDate(c.dueDate)}`,
            description: `${c.owner} • Evidence: ${c.evidenceCount}`,
            tone: "critical",
          }))}
        />
        <ActivityList
          title="Recent uploads"
          items={[
            {
              id: "up_001",
              title: "ETP Lab Report uploaded (GS-D)",
              time: "2026-04-04 10:12",
              tone: "info",
              meta: "ETP Monitoring",
              type: "upload",
            },
            {
              id: "up_002",
              title: "Electricity bill attached (GS-A)",
              time: "2026-04-02 16:40",
              tone: "compliant",
              meta: "Utilities",
              type: "document",
            },
            {
              id: "up_003",
              title: "Waste manifest uploaded (GS-A)",
              time: "2026-04-01 14:20",
              tone: "compliant",
              meta: "Waste disposal",
              type: "upload",
            },
          ]}
        />
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Expiring permits & documents</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {expiringPermits.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{d.title}</div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {d.expiresOn ? `Expires ${formatDate(d.expiresOn)}` : "No expiry date"} • {d.ownerDepartment}
                    </div>
                  </div>
                  <StatusBadge tone={d.status === "expired" ? "critical" : "warning"}>
                    <TriangleAlert className="size-3" />
                    {d.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
