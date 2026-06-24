import { RolesModule } from "@/features/admin/settings/modules/roles/module";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsRolesPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <RolesModule />
    </SettingsPageFrame>
  );
}



