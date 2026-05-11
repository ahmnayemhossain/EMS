import * as React from "react";

import { cn } from "@/components/ui/primitives/utils";

export function PageKpiGrid({
  children,
  className,
  columnsClassName = "sm:grid-cols-2 xl:grid-cols-6",
}: {
  children: React.ReactNode;
  className?: string;
  columnsClassName?: string;
}) {
  return (
    <div className={cn("grid gap-3", columnsClassName, className)}>
      {children}
    </div>
  );
}


