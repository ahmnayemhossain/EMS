import { UserWiseStatusModule } from "@/features/admin/settings/modules/screens/UserWiseStatusModule";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsUserWiseStatusPage() {
  return (
    <SettingsPageFrame backTo="/settings/approvals" backLabel="Approvals">
      <UserWiseStatusModule />
    </SettingsPageFrame>
  );
}
