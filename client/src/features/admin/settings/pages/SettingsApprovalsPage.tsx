import { useOutlet } from "react-router";

import { ApprovalsModule } from "@/features/admin/settings/modules/screens/ApprovalsModule";

export function SettingsApprovalsPage() {
  const outlet = useOutlet();
  if (outlet) {
    return outlet;
  }
  return <ApprovalsModule />;
}
