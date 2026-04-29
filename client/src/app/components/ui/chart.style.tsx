"use client";

import type { ChartConfig } from "./chart.types";
import { THEMES } from "./chart.types";

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.theme || item.color);
  if (!colorConfig.length) return null;
  return <style dangerouslySetInnerHTML={{ __html: Object.entries(THEMES).map(([theme, prefix]) => `\n${prefix} [data-chart=${id}] {\n${colorConfig.map(([key, item]) => { const color = item.theme?.[theme as keyof typeof item.theme] || item.color; return color ? `  --color-${key}: ${color};` : null; }).join("\n")}\n}\n`).join("\n") }} />;
}
