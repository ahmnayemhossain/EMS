import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";
import { MetersSettingsModule } from "../modules/screens/MetersSettingsModule";

export function SettingsMetersPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <MetersSettingsModule />
    </SettingsPageFrame>
  );
}



