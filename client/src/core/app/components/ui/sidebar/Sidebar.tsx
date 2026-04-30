"use client";

import { cn } from "@/core/app/components/ui/utils";
import { useSidebar } from "@/core/app/components/ui/sidebar/context";
import { SidebarDesktop } from "@/core/app/components/ui/sidebar/SidebarDesktop";
import { SidebarMobile } from "@/core/app/components/ui/sidebar/SidebarMobile";

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return <SidebarMobile openMobile={openMobile} setOpenMobile={setOpenMobile} side={side} {...props}>{children}</SidebarMobile>;
  }

  return <SidebarDesktop state={state} side={side} variant={variant} collapsible={collapsible} className={className} {...props}>{children}</SidebarDesktop>;
}
