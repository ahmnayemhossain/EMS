import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router";

import { SidebarMenuButton, useSidebar } from "@/components/ui/primitives/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
import type { AppNavItem } from '@/core/sidebar/sidebar.config';

export function AppSidebarMoreMenu({ items }: { items: AppNavItem[] }) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const [open, setOpen] = React.useState(false);
  const hoverOpen = state === "collapsed" && !isMobile;
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (!closeTimeoutRef.current) return;
    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
  };

  const queueClose = () => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  React.useEffect(() => () => cancelClose(), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          className="justify-center rounded-lg group-data-[collapsible=icon]:gap-0"
          onBlur={() => hoverOpen && queueClose()}
          onFocus={() => hoverOpen && setOpen(true)}
          onMouseEnter={() => hoverOpen && (cancelClose(), setOpen(true))}
          onMouseLeave={() => hoverOpen && queueClose()}
        >
          <MoreHorizontal className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">More</span>
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        collisionPadding={12}
        sideOffset={6}
        className="w-56 rounded-xl border border-border/80 p-1.5 shadow-none"
        onMouseEnter={() => hoverOpen && cancelClose()}
        onMouseLeave={() => hoverOpen && queueClose()}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => {
                setOpen(false);
                if (isMobile) setOpenMobile(false);
              }}
              className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors"
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

