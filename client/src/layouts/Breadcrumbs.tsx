import * as React from "react";
import { Link, useLocation } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "audit-calendar": "Audit calendar",
  facilities: "Factories",
  factories: "Factories",
  utilities: "Utilities",
  chemicals: "Chemicals",
  sds: "SDS",
  waste: "Waste",
  wastewater: "Wastewater / ETP",
  audits: "Audits",
  capa: "CAPA",
  reports: "Reports",
  documents: "Documents",
  incidents: "Incidents",
  training: "Training",
  settings: "Settings",
  notifications: "Notifications",
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (!segments.length) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, index) => {
          const isLast = index === segments.length - 1;
          const to = `/${segments.slice(0, index + 1).join("/")}`;
          const label = LABELS[seg] ?? seg;

          return (
            <React.Fragment key={`${to}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
