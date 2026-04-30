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

import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { ChartContainer } from "@/core/app/components/ui/chart";

export function WastewaterTrendCard({
  data,
}: {
  data: Array<{ date: string; pH: number; COD: number; BOD: number }>;
}) {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader className="pb-2">
        <CardTitle>Trends</CardTitle>
        <div className="text-muted-foreground text-sm">pH, COD and BOD (mock records)</div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          className="h-[280px] w-full"
          config={{
            pH: { label: "pH", color: "var(--chart-2)" },
            COD: { label: "COD", color: "var(--chart-4)" },
            BOD: { label: "BOD", color: "var(--chart-3)" },
          }}
        >
          <ResponsiveContainer>
            <LineChart data={data} margin={{ left: 6, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={56} />
              <Tooltip />
              <Line type="monotone" dataKey="pH" stroke="var(--color-pH)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="COD" stroke="var(--color-COD)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="BOD" stroke="var(--color-BOD)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

