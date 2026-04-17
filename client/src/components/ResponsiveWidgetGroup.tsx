import * as React from "react";

import { cn } from "@/app/components/ui/utils";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { MobileHScroll } from "@/components/MobileHScroll";

export function ResponsiveWidgetGroup({
  items,
  desktopClassName,
  mobileItemClassName,
}: {
  items: Array<{ key: string; node: React.ReactNode }>;
  desktopClassName: string;
  mobileItemClassName?: string;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileHScroll>
        {items.map((item) => (
          <div
            key={item.key}
            className={cn("w-[min(92vw,520px)] shrink-0", mobileItemClassName)}
          >
            {item.node}
          </div>
        ))}
      </MobileHScroll>
    );
  }

  return <div className={cn(desktopClassName)}>{items.map((i) => i.node)}</div>;
}
