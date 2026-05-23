import { LayoutGrid } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/primitives/card';
import type { DashboardWidgetType } from '@/core/app/state/slices/dashboard-builder.types';
import { AuditCalendarCard } from '@/features/overview/dashboard/components/AuditCalendarCard';
import { CompanySnapshotWidget } from '@/features/overview/dashboard/components/CompanySnapshotWidget';
import { UtilityApprovalQueueWidget } from '@/features/overview/dashboard/components/UtilityApprovalQueueWidget';
import { UtilityOverviewWidget } from '@/features/overview/dashboard/components/UtilityOverviewWidget';
import { UtilityTrendCard } from '@/features/overview/dashboard/components/UtilityTrendCard';
import { getDashboardWidgetPreset } from '@/features/overview/dashboard/config/widget-presets';
import type { DashboardWidgetData } from '@/features/overview/dashboard/services/useDashboardWidgetData';

export type DashboardWidgetDefinition = {
  id: string;
  name: string;
  templateKey: string;
  description: string;
  defaultSpan: number;
  defaultRows: number;
  status: 0 | 1;
};

export type WidgetPaletteItem = {
  type: DashboardWidgetType;
  label: string;
  description: string;
  defaultSpan: number;
  defaultRows: number;
};

export function toWidgetPalette(definitions: DashboardWidgetDefinition[]) {
  return definitions
    .filter((item) => Number(item.status) === 1)
    .map((item) => ({
      type: item.id,
      label: item.name,
      description:
        item.description || getDashboardWidgetPreset(item.templateKey)?.description || '',
      defaultSpan: item.defaultSpan,
      defaultRows: item.defaultRows,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function renderDashboardWidget(
  type: DashboardWidgetType,
  definitions: DashboardWidgetDefinition[],
  data: DashboardWidgetData,
) {
  const definition = definitions.find((item) => item.id === type);
  if (!definition) return <MissingWidgetState title="Widget removed" />;

  switch (definition.templateKey) {
    case 'utility_overview':
      return <UtilityOverviewWidget overview={data.utilityOverview} />;
    case 'utility_trend':
      return <UtilityTrendCard points={data.utilityTrend} />;
    case 'utility_approval_queue':
      return <UtilityApprovalQueueWidget queue={data.utilityApprovalQueue} />;
    case 'company_snapshot':
      return <CompanySnapshotWidget snapshot={data.companySnapshot} />;
    case 'audit_calendar':
      return <AuditCalendarCard selectedDate={new Date()} />;
    default:
      return <MissingWidgetState title={definition.name} />;
  }
}

function MissingWidgetState({ title }: { title: string }) {
  return (
    <Card className="h-full rounded-[18px] border border-border/10 bg-slate-950 shadow-sm">
      <CardContent className="flex h-full flex-col justify-between gap-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {title}
          </div>
          <div className="rounded-full border border-border/20 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">
            widget
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-slate-400">
            <LayoutGrid className="size-5" />
          </div>
        </div>
        <div className="text-xs leading-5 text-slate-500">
          This widget preset is not available right now.
        </div>
      </CardContent>
    </Card>
  );
}
