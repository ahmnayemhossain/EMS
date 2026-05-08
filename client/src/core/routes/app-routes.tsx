import { Navigate } from "react-router";

import { NotFoundPage } from "@/core/NotFoundPage";
import { RouteErrorPage } from "@/core/RouteErrorPage";
import { appRouteDefs } from "@/core/routes/app-route-registry";
import { lazyPage } from "@/core/routes/lazy-page";
import { ProtectedAppShell } from "@/core/routes/protected-shell";
import { settingsRoute } from "@/core/routes/settings-routes";

export const appRoutes = [{
  path: "/",
  element: <ProtectedAppShell />,
  errorElement: <RouteErrorPage />,
  children: [
    { index: true, element: <Navigate to="/dashboard" replace /> },
    { path: "index.html", element: <Navigate to="/dashboard" replace /> },
    { path: "notifications", element: <Navigate to="/inbox" replace /> },
    { path: "inbox", lazy: lazyPage(() => import("@/features/InboxPage"), "InboxPage") },
    ...appRouteDefs.filter((item) => item.load && item.exportName).map((item) => ({ path: item.path, lazy: lazyPage(item.load!, item.exportName!) })),
    settingsRoute,
    { path: "*", element: <NotFoundPage /> },
  ],
}];
