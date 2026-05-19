import * as React from "react";

import { DASH_COLS, DASH_GAP, DASH_GROUP_SPAN, DASH_ROW_HEIGHT } from "../config/builder.constants";
import { useDashboardInteraction } from "../config/dashboardInteraction";

export function DashboardCanvasOverlay({ rows, active }: { rows: number; active: boolean }) {
  const interaction = useDashboardInteraction();
  const opacity = interaction.isInteracting ? 0.7 : active ? 0.16 : 0;
  if (!active) return null;
  return (
    <div
      aria-hidden="true"
      className="dashboard-layout-overlay"
      style={{ ["--dash-grid-cols" as never]: DASH_COLS, ["--dash-grid-gap" as never]: `${DASH_GAP}px`, ["--dash-grid-row-height" as never]: `${DASH_ROW_HEIGHT}px`, opacity } as React.CSSProperties}
    >
      {Array.from({ length: (DASH_COLS / DASH_GROUP_SPAN) * rows }).map((_, index) => (
        <div key={index} className="dashboard-layout-cell" style={{ gridColumn: `span ${DASH_GROUP_SPAN} / span ${DASH_GROUP_SPAN}` }} />
      ))}
    </div>
  );
}
