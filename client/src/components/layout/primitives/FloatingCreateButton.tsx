import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/components/ui/primitives/utils";

export const FloatingCreateButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    label?: string;
    icon?: React.ReactNode;
  }
>(function FloatingCreateButton(
  {
    label = "Create",
    icon,
    className,
    ...props
  },
  ref,
) {
  return (
    <Button
      ref={ref}
      type="button"
      size="icon"
      aria-label={label}
      title={label}
      className={cn(
        "fixed bottom-6 right-6 z-30 size-14 rounded-full border border-slate-200/80 bg-white/95 text-emerald-600 shadow-[0_2px_6px_rgba(15,23,42,0.28),0_4px_12px_rgba(15,23,42,0.18)] backdrop-blur-md transition-[transform,box-shadow,border-color,color,background-color] hover:scale-[1.03] hover:border-emerald-300 hover:bg-emerald-50/95 hover:text-emerald-700 hover:shadow-[0_2px_8px_rgba(15,23,42,0.3),0_6px_14px_rgba(16,185,129,0.18)] active:scale-[0.98] dark:border-slate-800/80 dark:bg-slate-950/90 dark:text-emerald-400 dark:shadow-[0_2px_8px_rgba(2,6,23,0.62),0_4px_14px_rgba(2,6,23,0.44)] dark:hover:border-emerald-700 dark:hover:bg-emerald-950/80 dark:hover:text-emerald-300 dark:hover:shadow-[0_2px_9px_rgba(2,6,23,0.64),0_6px_16px_rgba(5,150,105,0.2)]",
        className,
      )}
      {...props}
    >
      {icon ?? <Plus className="size-7 drop-shadow-sm" strokeWidth={3} />}
    </Button>
  );
});
