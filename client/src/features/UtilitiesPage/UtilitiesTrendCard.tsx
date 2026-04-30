import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/core/app/components/ui/card";
import { ChartContainer } from "@/core/app/components/ui/chart";
import { useIsMobile } from "@/core/app/components/ui/use-mobile";
import { cn } from "@/core/app/components/ui/utils";

export function UtilitiesTrendCard({
  data,
  className,
}: {
  data: Array<{ label: string; value: number }>;
  className?: string;
}) {
  const isMobile = useIsMobile();

  return (
    <Card className={cn("shadow-xs xl:col-span-2", className)}>
      <CardContent className="pt-6">
        <ChartContainer
          className={cn("w-full", isMobile ? "h-[220px]" : "h-[260px]")}
          config={{ value: { label: "Value", color: "var(--chart-2)" } }}
        >
          {data.length ? (
            <ResponsiveContainer>
              <AreaChart data={data} margin={{ left: 6, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={6} />
                <YAxis tickLine={false} axisLine={false} width={isMobile ? 42 : 56} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  fill="color-mix(in oklab, var(--color-value) 15%, transparent)"
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
