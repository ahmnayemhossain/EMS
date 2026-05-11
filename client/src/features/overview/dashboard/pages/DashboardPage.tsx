import * as React from "react";

import { useIsMobile } from "@/components/ui/primitives/use-mobile";
import { useDashboardLayout } from "@/core/app/state/slices/dashboard-layout";
import { PageHeader } from "@/components/layout/primitives/PageHeader";

import { DashboardSectionItem } from "../components/DashboardSectionItem";
import { DashboardActions } from "../dashboard/actions";
import { buildDashboardSections } from "../dashboard/sections";

export function DashboardPage() {
  const isMobile = useIsMobile();
  const [customize, setCustomize] = React.useState(false);
  const { sectionOrder, moveSection, reset: resetLayout } = useDashboardLayout();
  const enabled = Boolean(customize) && !isMobile;
  const sectionsByKey = buildDashboardSections(enabled);

  return (
    <div className="aws-dashboard-grid space-y-6 py-2">
      <PageHeader
        actions={
          <DashboardActions
            customize={customize}
            isMobile={isMobile}
            setCustomize={setCustomize}
            resetLayout={resetLayout}
          />
        }
      />
      <div className="space-y-4">
        {sectionOrder.map((key, index) => (
          <DashboardSectionItem
            key={key}
            id={key}
            index={index}
            enabled={enabled}
            onMove={moveSection}
          >
            {sectionsByKey[key]}
          </DashboardSectionItem>
        ))}
      </div>
    </div>
  );
}

