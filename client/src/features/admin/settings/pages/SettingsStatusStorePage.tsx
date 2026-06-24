import { StatusStoreModule } from "@/features/admin/settings/modules/screens/StatusStoreModule";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsStatusStorePage() {
  return (
    <SettingsPageFrame backTo="/settings/approvals" backLabel="Approvals">
      <StatusStoreModule />
    </SettingsPageFrame>
  );
}
