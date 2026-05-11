import { cn } from "@/components/ui/primitives/utils";
import { SettingsLauncherCard } from "@/features/admin/settings/home/SettingsLauncherCard";
import { settingsCards } from "@/features/admin/settings/home/settings-cards";
import type { SettingsCardKey, SettingsTab } from "@/features/admin/settings/home/settings-types";

export function SettingsTabPanel(props: {
  tab: SettingsTab;
  onOpenDrawer: (key: SettingsCardKey) => void;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3")}>
      {settingsCards
        .filter((card) => card.tab === props.tab)
        .map((card) => <SettingsLauncherCard key={card.key} def={card} onOpenDrawer={props.onOpenDrawer} />)}
    </div>
  );
}

