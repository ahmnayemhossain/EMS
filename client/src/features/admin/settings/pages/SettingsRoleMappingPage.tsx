import { RoleMappingSettingsModule } from "@/features/admin/settings/modules/screens/RoleMappingSettingsModule";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsRoleMappingPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <RoleMappingSettingsModule />
    </SettingsPageFrame>
  );
}
