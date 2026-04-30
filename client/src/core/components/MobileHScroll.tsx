import * as React from "react";

import { cn } from "@/core/app/components/ui/utils";

export function MobileHScroll({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-4 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max gap-3 md:grid md:w-auto md:gap-4",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
