import * as React from "react";
import { Outlet, matchPath, useLocation } from "react-router";

import { appRouteDefs } from "@/core/routes/app-route-registry";
import { publicRouteDefs } from "@/core/routes/public-route-registry";
import { routeLabels } from "@/core/routes/route-labels";
import { settingsRouteDefs } from "@/features/admin/settings/config/settings-route-registry";

const baseTitle = "EMS";

const routeTitleEntries = [
  { path: "/inbox", label: "Inbox" },
  { path: "/report-box", label: "Report box" },
  { path: "/settings", label: "Settings" },
  ...publicRouteDefs.map((item) => ({
    path: normalizePath(item.path),
    label: item.label,
  })),
  ...appRouteDefs.map((item) => ({
    path: normalizePath(item.path),
    label: item.label,
  })),
  ...settingsRouteDefs
    .filter((item) => item.openAs === "page")
    .map((item) => ({
      path: `/settings/${item.segment}`,
      label: item.title,
    })),
].sort((left, right) => right.path.length - left.path.length);

export function RouteTitleRoot() {
  const location = useLocation();

  React.useEffect(() => {
    document.title = resolveDocumentTitle(location.pathname);
  }, [location.pathname]);

  return <Outlet />;
}

function resolveDocumentTitle(pathname: string) {
  if (!pathname || pathname === "/") {
    return baseTitle;
  }

  const matchedEntry = routeTitleEntries.find((entry) =>
    Boolean(matchPath({ path: entry.path, end: true }, pathname)),
  );

  if (matchedEntry) {
    return `${baseTitle} . ${matchedEntry.label}`;
  }

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const fallbackLabel =
    routeLabels[lastSegment] ?? humanizeSegment(lastSegment);

  return `${baseTitle} . ${fallbackLabel}`;
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function humanizeSegment(segment: string) {
  const decoded = decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

  if (!decoded) {
    return baseTitle;
  }

  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

