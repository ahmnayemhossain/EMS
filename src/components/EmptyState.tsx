import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; onClick: () => void };
}) {
  return (
      <Card className="shadow-xs">
      <CardContent className="grid place-items-center gap-2 p-10 text-center">
        <div className="bg-muted text-muted-foreground grid shrink-0 size-12 place-items-center rounded-2xl border">
          <Icon className="size-5" />
        </div>
        <div className="mt-2 text-base font-semibold">{title}</div>
        {description ? (
          <div className="text-muted-foreground max-w-md text-sm">
            {description}
          </div>
        ) : null}
        {action ? (
          <div className="mt-2">
            <Button onClick={action.onClick}>{action.label}</Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
