import { SettingsHomePage } from "@/features/admin/settings/pages/SettingsHomePage";
import { SettingsLayout } from "@/features/admin/settings/pages/SettingsLayout";
import { lazyPage } from "@/core/routes/lazy-page";
import { settingsRouteDefs } from "@/features/admin/settings/config/settings-route-registry";

export const settingsRoute = {
  path: "settings",
  element: <SettingsLayout />,
  children: [
    { index: true, element: <SettingsHomePage /> },
    ...settingsRouteDefs.filter((item) => item.openAs === "page" && item.load && item.exportName).map((item) => ({ path: item.segment, lazy: lazyPage(item.load!, item.exportName!) })),
  ],
};
