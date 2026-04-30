import * as React from "react";
import { Link, useLocation } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/core/app/components/ui/breadcrumb";
import { routeLabels } from "@/core/routes/route-labels";

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
          const label = routeLabels[seg] ?? seg;

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
