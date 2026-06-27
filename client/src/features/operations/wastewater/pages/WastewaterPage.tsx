import * as React from "react";

import { ResponsiveWidgetGroup } from "@/components/layout/primitives/ResponsiveWidgetGroup";
import { DataTable } from "@/components/table/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { useSelectedCompany } from "@/core/app/state/slices/company";

import { WastewaterCreateDialog } from "../components/WastewaterCreateDialog";
import { WastewaterDetailPanel } from "../components/WastewaterDetailPanel";
import { WastewaterKpis } from "../components/WastewaterKpis";
import { WastewaterLatestCard } from "../components/WastewaterLatestCard";
import { WastewaterThresholdsCard } from "../components/WastewaterThresholdsCard";
import { WastewaterTrendCard } from "../components/WastewaterTrendCard";
import { wastewaterThresholds } from "../config/constants";
import { useWastewaterPage } from "../hooks/use-wastewater-page";

export function WastewaterPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const page = useWastewaterPage({
    companies,
    selectedCompanyId: selectedCompanyId || undefined,
  });

  return (
    <div className="space-y-6">
      <WastewaterCreateDialog
        companies={companies}
        initialCompanyId={selectedCompanyId || undefined}
        onCreated={page.reload}
        floating
      />

      <WastewaterKpis
        totalSamples={page.rows.length}
        outletSamples={page.rows.filter((row) => row.point === "outlet").length}
        latestPh={page.latestOutlet ? page.latestOutlet.pH : "-"}
        latestCod={page.latestOutlet ? `${page.latestOutlet.COD} mg/L` : "-"}
        latestBod={page.latestOutlet ? `${page.latestOutlet.BOD} mg/L` : "-"}
        exceedanceCount={page.exceedances}
      />

      <ResponsiveWidgetGroup
        desktopClassName="grid gap-4 xl:grid-cols-3"
        mobileItemClassName="w-[min(92vw,560px)]"
        items={[
          {
            key: "trend",
            node: (
              <div className="xl:col-span-2">
                <WastewaterTrendCard data={page.trend} />
              </div>
            ),
          },
          {
            key: "latest",
            node: (
              <WastewaterLatestCard
                record={page.latestOutlet}
                companyName={page.latestOutlet ? page.getCompanyName(page.latestOutlet.facilityId) : "Company"}
              />
            ),
          },
          {
            key: "thresholds",
            node: <WastewaterThresholdsCard thresholds={wastewaterThresholds} />,
          },
        ]}
      />

      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b pb-4">
          <div className="min-w-0">
            <CardTitle>Sample records</CardTitle>
            <div className="text-muted-foreground mt-1 text-sm">
              Open any row to review lab values, report file, and notes.
            </div>
          </div>
          <div className="bg-muted text-foreground rounded-full px-3 py-1 text-xs font-semibold">
            {page.rows.length} records
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            rows={page.rows}
            columns={page.columns}
            rowKey={(row) => row.id}
            onRowClick={(row) => {
              page.setSelected(row);
              page.setDetailOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <WastewaterDetailPanel
        open={page.detailOpen}
        onOpenChange={page.setDetailOpen}
        record={page.selected}
        companies={companies}
        getCompanyName={page.getCompanyName}
        onSave={page.saveRecord}
        onDelete={page.removeRecord}
        saving={page.saving}
        deleting={page.deleting}
      />
    </div>
  );
}
