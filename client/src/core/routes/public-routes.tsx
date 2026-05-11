import { Navigate } from "react-router";

import { RouteErrorPage } from "@/core/errors/RouteErrorPage";
import { lazyPage } from "@/core/routes/lazy-page";
import { publicRouteDefs } from "@/core/routes/public-route-registry";

export const publicRoutes = [
  ...publicRouteDefs.map((item) => ({ path: item.path, lazy: lazyPage(item.load, item.exportName), errorElement: <RouteErrorPage /> })),
  { path: "/report-box", element: <Navigate to="/rb/hfl" replace />, errorElement: <RouteErrorPage /> },
  { path: "report-box", element: <Navigate to="/rb/hfl" replace />, errorElement: <RouteErrorPage /> },
];
