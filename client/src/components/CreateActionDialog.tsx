import * as React from "react";

import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { cn } from "@/app/components/ui/utils";

export function CreateActionDialog({
  title,
  triggerLabel = "Create",
  submitLabel = "Create",
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger,
  contentClassName,
  children,
  onCreate,
  submitDisabled,
}: {
  title: string;
  triggerLabel?: string;
  submitLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  contentClassName?: string;
  children: React.ReactNode;
  onCreate?: () => void | boolean | Promise<void | boolean>;
  submitDisabled?: boolean;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {hideTrigger ? null : (
        <DialogTrigger asChild>
          <Button>{triggerLabel}</Button>
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          "grid max-h-[calc(100svh-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-h-[calc(100svh-2rem)]",
          contentClassName,
        )}
      >
        <DialogHeader className="border-b px-4 py-4 pr-12 sm:px-6">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]"
          onSubmit={async (e) => {
            e.preventDefault();
            const result = await onCreate?.();
            if (result === false) return;
            setOpen(false);
          }}
        >
          <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
          <DialogFooter className="border-t bg-background px-4 py-3 sm:px-6">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={submitDisabled}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
