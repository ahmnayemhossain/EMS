import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { renderSettingsDrawer } from "@/features/admin/settings/home/SettingsDrawerContent";
import { settingsCards, settingsTabs } from "@/features/admin/settings/home/settings-cards";
import { findSettingsCard } from "@/features/admin/settings/settings-route-registry";
import { SettingsTabPanel } from "@/features/admin/settings/home/SettingsTabPanel";
import type { SettingsCardKey, SettingsTab } from "@/features/admin/settings/home/settings-types";

export function SettingsHomePage() {
  const [tab, setTab] = React.useState<SettingsTab>("system");
  const [drawerKey, setDrawerKey] = React.useState<SettingsCardKey | null>(null);
  const openDef = findSettingsCard(drawerKey);

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(value) => setTab(value as SettingsTab)} className="space-y-4">
        <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:w-auto sm:grid-cols-4">
          {settingsTabs.map((value) => <TabsTrigger key={value} value={value}>{titleCase(value)}</TabsTrigger>)}
        </TabsList>
        {settingsTabs.map((value) => (
          <TabsContent key={value} value={value} className="m-0">
            <SettingsTabPanel tab={value} onOpenDrawer={setDrawerKey} />
          </TabsContent>
        ))}
      </Tabs>
      <DetailPanel open={Boolean(drawerKey)} onOpenChange={(open) => !open && setDrawerKey(null)} title={openDef?.title || "Settings"} description={openDef?.description}>
        {renderSettingsDrawer(drawerKey)}
      </DetailPanel>
    </div>
  );
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

