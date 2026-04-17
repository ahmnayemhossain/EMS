import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/app/components/ui/card";
import { ChartContainer } from "@/app/components/ui/chart";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";

export function UtilitiesTrendCard({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const isMobile = useIsMobile();

  return (
    <Card className="shadow-xs xl:col-span-2">
      <CardContent className="pt-6">
        <div className={cn(isMobile ? "-mx-3 overflow-x-auto px-3" : undefined)}>
          <div className={cn(isMobile ? "min-w-[620px]" : undefined)}>
            <ChartContainer
              className={cn("w-full", isMobile ? "h-[220px]" : "h-[260px]")}
              config={{ value: { label: "Value", color: "var(--chart-2)" } }}
            >
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
            </ChartContainer>
          </div>
        </div>
        <div className="text-muted-foreground mt-2 text-xs">
          Trend chart placeholder; wire to real time-series later.
        </div>
      </CardContent>
    </Card>
  );
}
