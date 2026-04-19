import * as React from "react";
import { ChevronDown, ChevronRight, GripVertical, LayoutGrid } from "lucide-react";

import { CardHeader } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";

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
      className="flex-row items-center justify-between gap-3 space-y-0"
      role="button"
      tabIndex={0}
      onClick={() => onToggleCollapsed()}
    >
      <div className="flex min-w-0 items-center gap-2">
        {enabled && !isMobile ? (
          <div
            ref={dragHandleRef}
            role="button"
            tabIndex={0}
            aria-label="Drag container"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md border bg-background shadow-sm",
              "cursor-grab active:cursor-grabbing touch-none",
            )}
            title="Drag container"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-4 text-muted-foreground" />
          </div>
        ) : (
          <div className="grid size-8 place-items-center rounded-md border bg-muted/20">
            <LayoutGrid className="size-4 text-muted-foreground" />
          </div>
        )}

        {enabled ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onRename(draft)}
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
