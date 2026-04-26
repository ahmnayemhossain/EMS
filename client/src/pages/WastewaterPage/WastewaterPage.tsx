import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { ResponsiveWidgetGroup } from "@/components/ResponsiveWidgetGroup";
import { capas, getFacilityName, wastewaterRecords } from "@/data/mock";
import { formatDate } from "@/utils/format";

import { wastewaterThresholds } from "./constants";
import { getWastewaterColumns } from "./columns";
import { WastewaterCreateDialog } from "./components/WastewaterCreateDialog";
import { WastewaterDosingLogCard } from "./components/WastewaterDosingLogCard";
import { WastewaterKpis } from "./components/WastewaterKpis";
import { WastewaterLinkedCapasCard } from "./components/WastewaterLinkedCapasCard";
import { WastewaterSludgeCard } from "./components/WastewaterSludgeCard";
import { WastewaterThresholdsCard } from "./components/WastewaterThresholdsCard";
import { WastewaterTrendCard } from "./components/WastewaterTrendCard";

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

  const cols = React.useMemo(
    () => getWastewaterColumns({ thresholds: wastewaterThresholds }),
    [],
  );

  const linkedCapas = capas.filter((c) => {
    const t = c.title.toLowerCase();
    return t.includes("etp") || t.includes("wastewater");
  });

  return (
    <div className="space-y-6">
      <PageHeader actions={<WastewaterCreateDialog />} />

      <WastewaterKpis
        inflow="—"
        outflow="—"
        latestPh={latest ? latest.pH : "—"}
        latestCod={latest ? `${latest.COD} mg/L` : "—"}
        latestBod={latest ? `${latest.BOD} mg/L` : "—"}
        exceedanceCount={exceedances}
      />

      <ResponsiveWidgetGroup
        desktopClassName="grid gap-4 xl:grid-cols-3"
        mobileItemClassName="w-[min(92vw,560px)]"
        items={[
          {
            key: "trend",
            node: (
              <div className="xl:col-span-2">
                <WastewaterTrendCard data={trend} />
              </div>
            ),
          },
          {
            key: "thresholds",
            node: <WastewaterThresholdsCard thresholds={wastewaterThresholds} />,
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-xs xl:col-span-2">
          <CardHeader>
            <CardTitle>Lab reports</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable rows={wastewaterRecords} columns={cols} rowKey={(r) => r.id} />
          </CardContent>
        </Card>

        <ResponsiveWidgetGroup
          desktopClassName="grid gap-4"
          mobileItemClassName="w-[min(92vw,520px)]"
          items={[
            { key: "sludge", node: <WastewaterSludgeCard /> },
            { key: "capa", node: <WastewaterLinkedCapasCard items={linkedCapas} /> },
            { key: "dosing", node: <WastewaterDosingLogCard /> },
          ]}
        />
      </div>
    </div>
  );
}
