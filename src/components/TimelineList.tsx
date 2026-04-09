import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";
import { StatusBadge, type StatusTone } from "@/components/StatusBadge";

export type TimelineItem = {
  id: string;
  title: string;
  date: string;
  description?: string;
  tone: StatusTone;
};

export function TimelineList({
  title,
  items,
}: {
  title: string;
  items: TimelineItem[];
}) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="pt-1">
                <div className="bg-muted grid size-3 place-items-center rounded-full border" />
                {idx !== items.length - 1 ? (
                  <div className="bg-border ml-[5px] mt-2 h-10 w-px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {item.date}
                    </div>
                  </div>
                  <StatusBadge tone={item.tone}>{item.tone}</StatusBadge>
                </div>
                {item.description ? (
                  <div className={cn("text-muted-foreground mt-2 text-sm")}>
                    {item.description}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

