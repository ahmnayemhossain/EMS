import { Navigate, useLocation } from "react-router";

import { useAuth } from "@/core/app/state/auth";
import { AppShell } from "@/core/layouts/AppShell";

export function ProtectedAppShell() {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  return <AppShell />;
}
