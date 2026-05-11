import * as React from "react";

import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { TrainingRecord } from "@/core/types/models/ems";

export function TrainingTeamsGrid({
  teamOptions,
  rows,
  onSelectTeam,
}: {
  teamOptions: Array<{ value: string; label: string }>;
  rows: TrainingRecord[];
  onSelectTeam: (audience: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {teamOptions.map((a) => {
        const teamRows = rows.filter((t) => t.audience === a.value);
        const overdue = teamRows.filter((t) => t.status === "overdue").length;
        const dueSoon = teamRows.filter((t) => t.status === "due_soon").length;
        const complete = teamRows.filter((t) => t.status === "complete").length;

        return (
          <Card key={a.value} className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{a.label}</CardTitle>
              <div className="text-muted-foreground text-xs">
                {teamRows.length} trainings
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={overdue ? "critical" : "compliant"}>Overdue: {overdue}</StatusBadge>
                <StatusBadge tone={dueSoon ? "warning" : "neutral"}>Due soon: {dueSoon}</StatusBadge>
                <StatusBadge tone="info">Complete: {complete}</StatusBadge>
              </div>
              <Button className="mt-3 w-full" variant="outline" onClick={() => onSelectTeam(a.value)}>
                View records
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


