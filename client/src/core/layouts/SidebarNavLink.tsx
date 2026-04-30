import * as React from "react";
import { Link, useMatch } from "react-router";

import { SidebarMenuButton, useSidebar } from "@/core/app/components/ui/sidebar";
import { cn } from "@/core/app/components/ui/utils";
import { useCan } from "@/core/app/state/permissions";

export function SidebarNavLink({
  to,
  end,
  icon,
  label,
  permission,
}: {
  to: string;
  end?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  permission?: string;
}) {
  const match = useMatch({ path: to, end: end ?? false });
  const isActive = Boolean(match);
  const { isMobile, setOpenMobile } = useSidebar();
  const canAccess = useCan(permission);

  if (!canAccess) return null;

  return (
    <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
      <Link
        to={to}
        onClick={() => {
          if (isMobile) setOpenMobile(false);
        }}
        className={cn(
          "relative rounded-lg [&>svg]:text-muted-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0",
          "before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-transparent",
          "data-[active=true]:bg-primary/10 data-[active=true]:text-sidebar-foreground data-[active=true]:[&>svg]:text-primary data-[active=true]:before:bg-primary",
        )}
      >
        {React.createElement(icon, { className: "size-4" })}
        <span className="group-data-[collapsible=icon]:hidden">{label}</span>
      </Link>
    </SidebarMenuButton>
  );
}
