import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { CardHeader } from "@/components/ui/primitives/card";
import { Input } from "@/components/ui/primitives/input";
import { useIsMobile } from "@/components/ui/primitives/use-mobile";
import { cn } from "@/components/ui/primitives/utils";

function DotsHandle({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-1", className)} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, idx) => (
        <span key={idx} className="block size-1.5 rounded-full bg-muted-foreground/70" />
      ))}
    </div>
  );
}

export function ContainerHeader({
  enabled,
  collapsed,
  title,
  dragHandleRef,
  onToggleCollapsed,
  onRename,
}: {
  enabled: boolean;
  collapsed: boolean;
  title: string;
  dragHandleRef?: (node: HTMLDivElement | null) => void;
  onToggleCollapsed: () => void;
  onRename: (title: string) => void;
}) {
  const isMobile = useIsMobile();
  const [draft, setDraft] = React.useState(title);

  React.useEffect(() => {
    setDraft(title);
  }, [title]);

  return (
    <CardHeader
      className={cn("flex-row items-center justify-between gap-3 space-y-0", enabled ? "pb-3" : undefined)}
      role="button"
      tabIndex={0}
      onClick={enabled ? undefined : () => onToggleCollapsed()}
    >
      <div className="flex min-w-0 items-center gap-2">
        {enabled && !isMobile ? (
          <div
            ref={dragHandleRef}
            role="button"
            tabIndex={0}
            aria-label="Drag container"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md",
              "bg-transparent text-muted-foreground hover:bg-muted/20",
              "cursor-grab active:cursor-grabbing touch-none",
            )}
            title="Drag"
            onClick={(e) => e.stopPropagation()}
          >
            <DotsHandle />
          </div>
        ) : null}

        {enabled ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onRename(draft.trim() || title)}
            onClick={(e) => e.stopPropagation()}
            className="h-8 w-[220px] max-w-[55vw] rounded-lg"
          />
        ) : (
          <div className="truncate text-sm font-semibold">{title}</div>
        )}
      </div>

      <div className="grid size-8 place-items-center rounded-md border bg-muted/10">
        {collapsed ? (
          <ChevronRight className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </div>
    </CardHeader>
  );
}


