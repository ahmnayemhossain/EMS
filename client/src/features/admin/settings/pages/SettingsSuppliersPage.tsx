import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";
import { ReferenceSettingsModule } from "../modules/screens/ReferenceSettingsModule";

export function SettingsSuppliersPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <ReferenceSettingsModule
        kind="suppliers"
        title="Suppliers"
        noun="Supplier"
        description="Suppliers and service providers used by operation modules."
      />
    </SettingsPageFrame>
  );
}



