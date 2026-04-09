import * as React from "react";
import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";

export function ComplianceScoreCard({
  title = "Compliance score",
  score,
  helper,
}: {
  title?: string;
  score: number; // 0-100
  helper?: string;
}) {
  const tone =
    score >= 85 ? "compliant" : score >= 70 ? "warning" : "critical";

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <StatusBadge tone={tone}>
            <ShieldCheck className="size-3" />
            {score}%
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Progress value={score} />
        {helper ? (
          <div className="text-muted-foreground text-xs">{helper}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

