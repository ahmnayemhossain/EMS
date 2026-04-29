export function LayoutOverlay({ rows, active }: { rows: number; active: boolean }) {
  return <div aria-hidden="true" className="dashboard-layout-overlay" style={{ ["--dash-grid-cols" as never]: 12, ["--dash-grid-gap" as never]: "16px", ["--dash-grid-row-height" as never]: "72px", opacity: active ? 1 : 0.28 } as React.CSSProperties}>{Array.from({ length: 4 * rows }).map((_, index) => <div key={index} className="dashboard-layout-cell" style={{ gridColumn: "span 3 / span 3" }}>+</div>)}</div>;
}
