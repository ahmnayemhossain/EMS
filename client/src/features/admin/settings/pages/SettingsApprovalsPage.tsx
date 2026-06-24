import { useOutlet } from "react-router";

import { ApprovalsModule } from "@/features/admin/settings/modules/screens/ApprovalsModule";
import { SettingsPageFrame } from "@/features/admin/settings/pages/SettingsPageFrame";

export function SettingsApprovalsPage() {
  const outlet = useOutlet();
  if (outlet) {
    return outlet;
  }
  return (
    <SettingsPageFrame backTo="/settings" backLabel="Settings">
      <ApprovalsModule />
    </SettingsPageFrame>
  );
}
