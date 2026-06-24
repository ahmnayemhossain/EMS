import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";
import { ReferenceSettingsModule } from "../modules/screens/ReferenceSettingsModule";

export function SettingsDepartmentsPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <ReferenceSettingsModule
        kind="departments"
        title="Departments"
        noun="Department"
        description="Standardize departments used by employees and users."
      />
    </SettingsPageFrame>
  );
}


