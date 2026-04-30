import { SettingsHomePage } from "@/core/settings/SettingsHomePage";
import { SettingsLayout } from "@/core/settings/SettingsLayout";
import { lazyPage } from "@/core/routes/lazy-page";
import { settingsRouteDefs } from "@/core/settings/settings-route-registry";

export const settingsRoute = {
  path: "settings",
  element: <SettingsLayout />,
  children: [
    { index: true, element: <SettingsHomePage /> },
    ...settingsRouteDefs.filter((item) => item.openAs === "page" && item.load && item.exportName).map((item) => ({ path: item.segment, lazy: lazyPage(item.load!, item.exportName!) })),
  ],
};
