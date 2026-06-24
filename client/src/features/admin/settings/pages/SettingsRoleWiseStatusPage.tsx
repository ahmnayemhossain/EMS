import { RoleMappingSettingsModule } from "@/features/admin/settings/modules/screens/RoleMappingSettingsModule";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsRoleWiseStatusPage() {
  return (
    <SettingsPageFrame backTo="/settings/approvals" backLabel="Approvals">
      <RoleMappingSettingsModule />
    </SettingsPageFrame>
  );
}
