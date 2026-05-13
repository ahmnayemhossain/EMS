import type { SettingsCardDef } from "@/features/admin/settings/home/settings-types";
import { settingsRouteDefs, settingsTabs } from "@/features/admin/settings/config/settings-route-registry";

export { settingsTabs };
export const settingsCards: SettingsCardDef[] = settingsRouteDefs;

