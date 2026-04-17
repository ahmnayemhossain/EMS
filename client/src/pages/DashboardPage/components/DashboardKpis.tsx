import * as React from "react";
import type { LucideIcon } from "lucide-react";

import type { StatusTone } from "@/components/StatusBadge";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import type { DashboardKpiKey } from "@/app/state/dashboard-layout";
import { useDashboardLayout } from "@/app/state/dashboard-layout";
import { KPIStatCard } from "@/components/KPIStatCard";
import { PageKpiGrid } from "@/components/PageKpiGrid";

import { DashboardGridItem } from "./DashboardGridItem";

export type DashboardKpi = {
  key: DashboardKpiKey;
  title: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon?: LucideIcon;
  tone?: StatusTone;
};

export function DashboardKpis({
  items,
  rearrangeEnabled,
}: {
  items: DashboardKpi[];
  rearrangeEnabled?: boolean;
}) {
  const isMobile = useIsMobile();
  const { kpiOrder, moveKpi, kpiSpanByKey, setKpiSpan } = useDashboardLayout();
  const enabled = Boolean(rearrangeEnabled) && !isMobile;
  const gridRef = React.useRef<HTMLDivElement | null>(null);

  const itemsByKey = React.useMemo(() => {
    const map = new Map<DashboardKpiKey, DashboardKpi>();
    for (const item of items) map.set(item.key, item);
    return map;
  }, [items]);

  const orderedItems = React.useMemo(() => {
    const out: DashboardKpi[] = [];
    for (const key of kpiOrder) {
      const item = itemsByKey.get(key);
      if (item) out.push(item);
    }
    for (const item of items) {
      if (!kpiOrder.includes(item.key)) out.push(item);
    }
    return out;
  }, [items, itemsByKey, kpiOrder]);

  if (isMobile) {
    return (
      <PageKpiGrid>
        {orderedItems.map((item) => (
          <div key={item.key} className="min-w-0">
            <KPIStatCard {...item} />
          </div>
        ))}
      </PageKpiGrid>
    );
  }

  return (
    <div ref={gridRef} className="grid grid-cols-12 gap-4">
      {orderedItems.map((item) => (
        <DashboardGridItem
          key={item.key}
          dndType="dashboard-kpi"
          id={item.key}
          enabled={enabled}
          gridRef={gridRef}
          span={kpiSpanByKey[item.key] ?? 2}
          minSpan={2}
          maxSpan={12}
          onMove={moveKpi}
          onSpanChange={(next) => setKpiSpan(item.key, next)}
        >
          <KPIStatCard {...item} />
        </DashboardGridItem>
      ))}
    </div>
  );
}
