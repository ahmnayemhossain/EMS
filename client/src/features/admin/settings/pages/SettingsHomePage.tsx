import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { renderSettingsDrawer } from "@/features/admin/settings/home/SettingsDrawerContent";
import { settingsCards, settingsTabs } from "@/features/admin/settings/home/settings-cards";
import { findSettingsCard } from "@/features/admin/settings/config/settings-route-registry";
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
          {settingsTabs.map((value) => (
            <TabsTrigger key={value} value={value} className={tabTriggerClassName(value)}>
              {titleCase(value)}
            </TabsTrigger>
          ))}
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

function tabTriggerClassName(tab: SettingsTab) {
  switch (tab) {
    case "system":
      return [
        "data-[state=active]:bg-sky-500/12",
        "data-[state=active]:text-sky-800",
        "data-[state=active]:border-sky-200",
        "dark:data-[state=active]:bg-sky-400/20",
        "dark:data-[state=active]:text-sky-200",
      ].join(" ");
    case "operations":
      return [
        "data-[state=active]:bg-emerald-500/12",
        "data-[state=active]:text-emerald-800",
        "data-[state=active]:border-emerald-200",
        "dark:data-[state=active]:bg-emerald-400/20",
        "dark:data-[state=active]:text-emerald-200",
      ].join(" ");
    case "compliance":
      return [
        "data-[state=active]:bg-amber-500/14",
        "data-[state=active]:text-amber-900",
        "data-[state=active]:border-amber-200",
        "dark:data-[state=active]:bg-amber-400/20",
        "dark:data-[state=active]:text-amber-200",
      ].join(" ");
    case "communications":
      return [
        "data-[state=active]:bg-violet-500/12",
        "data-[state=active]:text-violet-800",
        "data-[state=active]:border-violet-200",
        "dark:data-[state=active]:bg-violet-400/20",
        "dark:data-[state=active]:text-violet-200",
      ].join(" ");
    default:
      return "";
  }
}


