import { KPIStatCard } from "@/components/layout/primitives/KPIStatCard";
import { PageKpiGrid } from "@/components/layout/primitives/PageKpiGrid";
import type { CAPA } from "@/core/types/models/ems";

import { capaBoardColumns, isCapaOverdue } from "../config/board";

export function CapaSummary(props: { rows: CAPA[] }) {
  const overdue = props.rows.filter(isCapaOverdue).length;
  const open = props.rows.filter((item) => item.status !== "closed").length;

  return (
    <PageKpiGrid columnsClassName="xl:grid-cols-4">
      <KPIStatCard title="Open CAPA" value={open} tone={open ? "warning" : "compliant"} />
      <KPIStatCard title="Overdue" value={overdue} tone={overdue ? "critical" : "compliant"} />
      {capaBoardColumns.slice(1, 3).map((column) => (
        <KPIStatCard
          key={column.id}
          title={column.title}
          value={props.rows.filter((item) => item.status === column.id).length}
          tone={column.tone}
        />
      ))}
    </PageKpiGrid>
  );
}
