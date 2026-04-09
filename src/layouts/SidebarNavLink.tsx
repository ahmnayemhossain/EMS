import * as React from "react";
import { Link, useMatch } from "react-router";

import { SidebarMenuButton } from "@/app/components/ui/sidebar";
import { cn } from "@/app/components/ui/utils";

export function SidebarNavLink({
  to,
  end,
  icon,
  label,
}: {
  to: string;
  end?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const match = useMatch({ path: to, end: end ?? false });
  const isActive = Boolean(match);

  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <Link
        to={to}
        className={cn(
          "[&>svg]:text-muted-foreground data-[active=true]:[&>svg]:text-sidebar-accent-foreground",
        )}
      >
        {React.createElement(icon, { className: "size-4" })}
        <span>{label}</span>
      </Link>
    </SidebarMenuButton>
  );
}
