import * as React from "react";
import { CalendarDays } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ChartContainer } from "@/app/components/ui/chart";
import { cn } from "@/app/components/ui/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { formatNumber } from "@/utils/format";

export type UtilityTrendPoint = { month: string; kwh: number };

export function UtilityTrendCard({
  points,
  className,
}: {
  points: UtilityTrendPoint[];
  className?: string;
}) {
  return (
    <Card className={cn("shadow-xs min-w-0", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Group utility trend</CardTitle>
            <div className="text-muted-foreground mt-1 text-sm">
              Electricity consumption (kWh)
            </div>
          </div>
          <StatusBadge tone="info">
            <CalendarDays className="size-3" />
            Rolling 6 months
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          className="h-[260px] w-full"
          config={{ kwh: { label: "kWh", color: "var(--chart-2)" } }}
        >
          {points.length ? (
            <ResponsiveContainer>
              <AreaChart data={points} margin={{ left: 6, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={56} />
                <Tooltip
                  formatter={(v: number) => [formatNumber(v), "kWh"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="kwh"
                  stroke="var(--color-kwh)"
                  fill="color-mix(in oklab, var(--color-kwh) 15%, transparent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              No utility records yet.
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
