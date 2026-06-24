import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";
import { UsersModule } from "../modules/screens/UsersModule";

export function SettingsUsersPage() {
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <UsersModule />
    </SettingsPageFrame>
  );
}



