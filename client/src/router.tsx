import { createBrowserRouter, createHashRouter } from "react-router";

import { appRoutes } from "@/routes/app-routes";
import { publicRoutes } from "@/routes/public-routes";

const routes = [...publicRoutes, ...appRoutes];

export const router =
  typeof window !== "undefined" &&
  window.location.pathname === "/" &&
  window.location.hash.startsWith("#/")
    ? createHashRouter(routes)
    : createBrowserRouter(routes);
