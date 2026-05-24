import { SettingsHomePage } from "@/features/admin/settings/pages/SettingsHomePage";
import { SettingsLayout } from "@/features/admin/settings/pages/SettingsLayout";
import { lazyPage } from "@/core/routes/lazy-page";
import { settingsRouteDefs } from "@/features/admin/settings/config/settings-route-registry";

const approvalsParentRoute = settingsRouteDefs.find((item) => item.segment === "approvals");

const approvalChildRoutes = settingsRouteDefs
  .filter(
    (item) =>
      item.openAs === "page" &&
      item.load &&
      item.exportName &&
      item.segment.startsWith("approvals/"),
  )
  .map((item) => ({
    path: item.segment.replace("approvals/", ""),
    lazy: lazyPage(item.load!, item.exportName!),
  }));

export const settingsRoute = {
  path: "settings",
  element: <SettingsLayout />,
  children: [
    { index: true, element: <SettingsHomePage /> },
    ...settingsRouteDefs
      .filter(
        (item) =>
          item.openAs === "page" &&
          item.load &&
          item.exportName &&
          item.segment !== "approvals" &&
          !item.segment.startsWith("approvals/"),
      )
      .map((item) => ({ path: item.segment, lazy: lazyPage(item.load!, item.exportName!) })),
    {
      path: "approvals",
      lazy: lazyPage(approvalsParentRoute!.load!, approvalsParentRoute!.exportName!),
      children: approvalChildRoutes,
    },
  ],
};
