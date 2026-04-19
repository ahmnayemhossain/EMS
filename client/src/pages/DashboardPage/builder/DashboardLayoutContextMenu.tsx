import * as React from "react";
import { Plus, RotateCcw, Settings } from "lucide-react";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/app/components/ui/context-menu";

export function DashboardLayoutContextMenu({
  editMode,
  onEditModeChange,
  onAddContainer,
  onReset,
  children,
}: {
  editMode: boolean;
  onEditModeChange: (next: boolean) => void;
  onAddContainer: () => void;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-[220px]">
        <ContextMenuLabel className="flex items-center gap-2">
          <Settings className="size-4 text-muted-foreground" />
          Dashboard
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem
          checked={editMode}
          onCheckedChange={(v) => onEditModeChange(Boolean(v))}
        >
          Edit layout
        </ContextMenuCheckboxItem>
        <ContextMenuItem
          disabled={!editMode}
          onSelect={() => {
            onAddContainer();
          }}
        >
          <Plus className="size-4" />
          Add container
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            onReset();
          }}
        >
          <RotateCcw className="size-4" />
          Reset layout
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
