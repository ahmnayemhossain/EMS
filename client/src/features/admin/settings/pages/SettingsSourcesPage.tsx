import { SourcesModule } from "@/features/admin/settings/modules/sources/module";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsSourcesPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <SourcesModule />
    </SettingsPageFrame>
  );
}


