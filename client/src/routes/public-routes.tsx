import { Navigate } from "react-router";

import { PublicReportBoxPage } from "@/pages/PublicReportBoxPage";
import { RouteErrorPage } from "@/pages/RouteErrorPage";
import { SignInPage } from "@/pages/SignInPage";

export const publicRoutes = [
  { path: "/sign-in", element: <SignInPage />, errorElement: <RouteErrorPage /> },
  { path: "/report-box", element: <Navigate to="/rb/hfl" replace />, errorElement: <RouteErrorPage /> },
  { path: "report-box", element: <Navigate to="/rb/hfl" replace />, errorElement: <RouteErrorPage /> },
  { path: "/rb/:code", element: <PublicReportBoxPage />, errorElement: <RouteErrorPage /> },
  { path: "rb/:code", element: <PublicReportBoxPage />, errorElement: <RouteErrorPage /> },
];
