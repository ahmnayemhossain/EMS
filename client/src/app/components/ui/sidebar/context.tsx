"use client";

import * as React from "react";

import { TooltipProvider } from "@/app/components/ui/tooltip";
import { cn } from "@/app/components/ui/utils";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from "@/app/components/ui/sidebar/sidebar.constants";
import { useSidebarToggle } from "@/app/components/ui/sidebar/sidebar.hooks";
import type { SidebarContextProps } from "@/app/components/ui/sidebar/sidebar.types";

export { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON };

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const { open, setOpen, openMobile, setOpenMobile, toggleSidebar } = useSidebarToggle({
    isMobile,
    open: openProp,
    setOpenProp,
    defaultOpen,
  });
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}
