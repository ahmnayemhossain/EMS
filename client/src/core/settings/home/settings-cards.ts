import type { SettingsCardDef } from "@/core/settings/home/settings-types";
import { settingsRouteDefs, settingsTabs } from "@/core/settings/settings-route-registry";

export { settingsTabs };
export const settingsCards: SettingsCardDef[] = settingsRouteDefs;
