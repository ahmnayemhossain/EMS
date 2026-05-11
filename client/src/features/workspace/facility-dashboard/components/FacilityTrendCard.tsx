import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { ChartContainer } from "@/components/ui/primitives/chart";

export function FacilityTrendCard({
  title,
  description,
  config,
  lines,
  data,
}: {
  title: string;
  description: string;
  config: Record<string, { label: string; color: string }>;
  lines: Array<{ dataKey: string; strokeVar: string }>;
  data: Array<Record<string, unknown>>;
}) {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <div className="text-muted-foreground text-sm">{description}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer className="h-[260px] w-full" config={config}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ left: 6, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={56} />
              <Tooltip />
              {lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.strokeVar}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


