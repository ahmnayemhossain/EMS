import * as React from "react";

import { cn } from "@/components/ui/primitives/utils";
import { useIsMobile } from "@/components/ui/primitives/use-mobile";
import { MobileHScroll } from "@/components/layout/primitives/MobileHScroll";

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

