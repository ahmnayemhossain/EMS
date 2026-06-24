import { PageWiseStatusModule } from "@/features/admin/settings/modules/screens/PageWiseStatusModule";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsPageWiseStatusPage() {
  return (
    <SettingsPageFrame backTo="/settings/approvals" backLabel="Approvals">
      <PageWiseStatusModule />
    </SettingsPageFrame>
  );
}
