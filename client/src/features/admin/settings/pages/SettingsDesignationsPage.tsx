import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";
import { ReferenceSettingsModule } from "../modules/screens/ReferenceSettingsModule";

export function SettingsDesignationsPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <ReferenceSettingsModule
        kind="designations"
        title="Designations"
        noun="Designation"
        description="Manage job titles used across employee records."
      />
    </SettingsPageFrame>
  );
}


