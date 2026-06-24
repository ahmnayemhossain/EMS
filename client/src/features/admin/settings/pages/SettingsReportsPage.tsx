import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";
import { ReportsSettingsModule } from "../modules/screens/ReportsSettingsModule";

export function SettingsReportsPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <ReportsSettingsModule />
    </SettingsPageFrame>
  );
}



