import * as React from "react";
import { Bell } from "lucide-react";

import { notifications, getFacilityName } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        actions={
          <Button variant="outline">
            <Bell className="mr-2 size-4" />
            Mark all read
          </Button>
        }
      />

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{n.title}</div>
                      {!n.read ? <StatusBadge tone="warning">new</StatusBadge> : null}
                    </div>
                    <div className="text-muted-foreground mt-1 text-sm">{n.description}</div>
                    <div className="text-muted-foreground mt-2 text-xs">
                      {n.facilityId ? getFacilityName(n.facilityId) : "Group"} • {n.createdAt}
                    </div>
                  </div>
                  <StatusBadge tone={n.tone}>{n.tone}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
