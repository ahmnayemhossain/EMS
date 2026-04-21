import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { DashboardContainer, DashboardWidgetType } from "@/app/state/dashboard-builder.types";

import { WIDGET_PALETTE } from "./widgetPalette";

export function AddWidgetDialog({
  open,
  onOpenChange,
  containers,
  onAddWidget,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  containers: DashboardContainer[];
  onAddWidget: (containerId: string, type: DashboardWidgetType, defaultSpan: number) => void;
}) {
  const [containerId, setContainerId] = React.useState<string>(containers[0]?.id ?? "");

  React.useEffect(() => {
    if (!open) return;
    if (!containerId && containers[0]?.id) setContainerId(containers[0].id);
  }, [open, containerId, containers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-muted-foreground" />
            Add widgets
          </DialogTitle>
          <DialogDescription>
            Pick a container and add a widget to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Container</div>
            <Select value={containerId} onValueChange={setContainerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a container" />
              </SelectTrigger>
              <SelectContent>
                {containers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Widgets</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {WIDGET_PALETTE.map((w) => (
                <Button
                  key={w.type}
                  variant="outline"
                  className="h-auto justify-start py-3 text-left"
                  disabled={!containerId}
                  onClick={() => {
                    if (!containerId) return;
                    onAddWidget(containerId, w.type, w.defaultSpan);
                    onOpenChange(false);
                  }}
                >
                  {w.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

