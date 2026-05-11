import { Trash2 } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/primitives/context-menu";

export function WidgetContextMenu({
  label,
  onRemove,
  onSetSpan,
  children,
}: {
  label: string;
  onRemove: () => void;
  onSetSpan: (span: number) => void;
  children: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-[220px]">
        <ContextMenuLabel>{label}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Width</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-[180px]">
            {[3, 4, 6, 8, 12].map((s) => (
              <ContextMenuItem key={s} onSelect={() => onSetSpan(s)}>
                {s}/12
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={onRemove}>
          <Trash2 className="size-4" />
          Remove widget
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}


