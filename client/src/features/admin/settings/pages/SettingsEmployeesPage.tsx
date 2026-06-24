import { EmployeesModule } from "@/features/admin/settings/modules/employees/module";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsEmployeesPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <EmployeesModule />
    </SettingsPageFrame>
  );
}



