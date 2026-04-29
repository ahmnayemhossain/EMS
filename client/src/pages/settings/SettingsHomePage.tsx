import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { DetailPanel } from "@/components/DetailPanel";
import { renderSettingsDrawer } from "@/pages/settings/home/SettingsDrawerContent";
import { settingsCards, settingsTabs } from "@/pages/settings/home/settings-cards";
import { SettingsTabPanel } from "@/pages/settings/home/SettingsTabPanel";
import type { SettingsCardKey, SettingsTab } from "@/pages/settings/home/settings-types";

export function SettingsHomePage() {
  const [tab, setTab] = React.useState<SettingsTab>("system");
  const [drawerKey, setDrawerKey] = React.useState<SettingsCardKey | null>(null);
  const openDef = drawerKey ? settingsCards.find((card) => card.key === drawerKey) : null;

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(value) => setTab(value as SettingsTab)} className="space-y-4">
        <TabsList className="w-full sm:w-auto">
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
