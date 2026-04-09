import * as React from "react";
import { Download, FileText, LineChart, ShieldCheck } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { StatusBadge } from "@/components/StatusBadge";

const reportCards = [
  {
    title: "Audit readiness report",
    description: "Score, open items, evidence and expiring documents by factory.",
    icon: ShieldCheck,
    tone: "compliant" as const,
  },
  {
    title: "Utilities variance report",
    description: "Variance flags, baseline comparisons, and bill completeness.",
    icon: LineChart,
    tone: "info" as const,
  },
  {
    title: "Waste & disposal report",
    description: "Generation logs, backlog, manifests and vendor summaries.",
    icon: FileText,
    tone: "warning" as const,
  },
];

const recent = [
  { id: "rep_001", name: "Group_Audit_Readiness_Apr2026.pdf", generatedAt: "2026-04-08 11:32", status: "ready" },
  { id: "rep_002", name: "GS-D_ETP_Monitoring_Mar2026.xlsx", generatedAt: "2026-04-06 16:10", status: "ready" },
  { id: "rep_003", name: "Utilities_Variance_Mar2026.pdf", generatedAt: "2026-04-05 09:18", status: "queued" },
];

export function ReportsPage() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        actions={
          <Button>
            <Download className="mr-2 size-4" />
            Export
          </Button>
        }
      />

      <FilterBar
        left={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search report templates…" />
            </div>
            <DateRangePickerPlaceholder />
          </div>
        }
        right={<Button variant="outline">Saved filters</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards
          .filter((c) => c.title.toLowerCase().includes(search.trim().toLowerCase()) || !search.trim())
          .map((c) => (
            <Card key={c.title} className="shadow-xs">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <StatusBadge tone={c.tone}>
                    <c.icon className="size-3" />
                    Template
                  </StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground text-sm">{c.description}</div>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm">Generate</Button>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Recent generated reports</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {recent.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-3 rounded-xl border p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  <div className="text-muted-foreground mt-1 text-xs">Generated {r.generatedAt}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={r.status === "ready" ? "compliant" : "warning"}>{r.status}</StatusBadge>
                  <Button size="sm" variant="outline" disabled={r.status !== "ready"}>
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
