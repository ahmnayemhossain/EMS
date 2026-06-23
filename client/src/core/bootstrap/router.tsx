import { createBrowserRouter, createHashRouter } from "react-router";

import { appRoutes } from "@/core/routes/app-routes";
import { publicRoutes } from "@/core/routes/public-routes";
import { RouteTitleRoot } from "@/core/routes/RouteTitleRoot";

const routes = [
  {
    element: <RouteTitleRoot />,
    children: [...publicRoutes, ...appRoutes],
  },
];

export const router =
  typeof window !== "undefined" &&
  window.location.pathname === "/" &&
  window.location.hash.startsWith("#/")
    ? createHashRouter(routes)
    : createBrowserRouter(routes);
