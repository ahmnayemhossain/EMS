import * as React from "react";
import { FileText, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/core/app/components/ui/card";
import { StatusBadge, type StatusTone } from "@/core/components/StatusBadge";

export type ActivityItem = {
  id: string;
  title: string;
  time: string;
  tone: StatusTone;
  meta?: string;
  type: "upload" | "document";
};

export function ActivityList({
  title,
  items,
}: {
  title: string;
  items: ActivityItem[];
}) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="bg-muted text-muted-foreground grid shrink-0 size-9 md:size-10 place-items-center rounded-lg border">
                {item.type === "upload" ? (
                  <Upload className="size-4 md:size-5" />
                ) : (
                  <FileText className="size-4 md:size-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {item.title}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {item.time}
                      {item.meta ? ` • ${item.meta}` : ""}
                    </div>
                  </div>
                  <StatusBadge tone={item.tone}>{item.tone}</StatusBadge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
