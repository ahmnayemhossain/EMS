import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";
import { UtilitiesRulesSettingsModule } from "../modules/screens/UtilitiesRulesSettingsModule";

export function SettingsUtilitiesRulesPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <UtilitiesRulesSettingsModule />
    </SettingsPageFrame>
  );
}



