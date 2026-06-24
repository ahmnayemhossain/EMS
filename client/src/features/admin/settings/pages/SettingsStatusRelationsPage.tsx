import { StatusRelationsSettingsModule } from "@/features/admin/settings/modules/screens/StatusRelationsSettingsModule";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsStatusRelationsPage() {
  return (
    <SettingsPageFrame backTo="/settings/approvals" backLabel="Approvals">
      <StatusRelationsSettingsModule />
    </SettingsPageFrame>
  );
}
