import * as React from "react";
import { Settings } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        actions={
          <Button variant="outline">
            <Settings className="mr-2 size-4" />
            Save
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Thresholds" description="Wastewater and utilities thresholds (placeholder UI).">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border p-3">
              <div className="text-muted-foreground text-xs">pH (outlet)</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-medium">6.0–9.0</span>
                <StatusBadge tone="info">default</StatusBadge>
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-muted-foreground text-xs">COD (outlet)</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-medium">≤ 250 mg/L</span>
                <StatusBadge tone="info">default</StatusBadge>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Approvals" description="Chemical approvals and restricted list (placeholder UI).">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="text-sm font-medium">Restricted chemical list</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Control who can approve restricted items.
                </div>
              </div>
              <StatusBadge tone="warning">configured</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="text-sm font-medium">SDS completeness checks</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Require SDS before inventory approval.
                </div>
              </div>
              <StatusBadge tone="compliant">enabled</StatusBadge>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
