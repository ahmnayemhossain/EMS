import { CompaniesModule } from "@/features/admin/settings/modules/companies/module";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsCompaniesPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <CompaniesModule />
    </SettingsPageFrame>
  );
}


