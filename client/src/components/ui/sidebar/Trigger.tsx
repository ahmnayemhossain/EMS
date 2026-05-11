"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/components/ui/primitives/utils";
import { useSidebar } from "@/components/ui/sidebar/context";

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, state, isMobile, openMobile } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="sm"
      className={cn("size-8 p-0", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {isMobile ? (
        openMobile ? (
          <X className="size-4" />
        ) : (
          <Menu className="size-4" />
        )
      ) : state === "collapsed" ? (
        <ChevronRight className="size-3.5" />
      ) : (
        <ChevronLeft className="size-3.5" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

