import { PlaceholderModule } from "../modules/screens/PlaceholderModule";
import type { SettingsCardKey } from "@/features/admin/settings/home/settings-types";

export function renderSettingsDrawer(key: SettingsCardKey | null) {
  switch (key) {
    case "thresholds":
      return <PlaceholderModule title="Thresholds" description="Threshold rules to drive alerts and compliance scoring." />;
    case "email":
      return <PlaceholderModule title="Email setup" description="SMTP settings, sender, and email templates." />;
    default:
      return null;
  }
}

