import { PlaceholderModule } from "@/features/admin/settings/modules/PlaceholderModule";
import type { SettingsCardKey } from "@/features/admin/settings/home/settings-types";

export function renderSettingsDrawer(key: SettingsCardKey | null) {
  switch (key) {
    case "thresholds":
      return <PlaceholderModule title="Thresholds" description="Threshold rules to drive alerts and compliance scoring." />;
    case "approvals":
      return <PlaceholderModule title="Approvals" description="Restricted list, SDS requirements, and approval workflow settings." />;
    case "email":
      return <PlaceholderModule title="Email setup" description="SMTP settings, sender, and email templates." />;
    case "complaint_box":
      return <PlaceholderModule title="Complaint box settings" description="Public URL behavior, retention policy, and moderation workflow." />;
    default:
      return null;
  }
}
