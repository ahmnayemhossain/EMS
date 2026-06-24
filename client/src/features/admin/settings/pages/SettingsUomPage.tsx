import { UomModule } from "@/features/admin/settings/modules/uom/module";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsUomPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <UomModule />
    </SettingsPageFrame>
  );
}


