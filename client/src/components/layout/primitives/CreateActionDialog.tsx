import * as React from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/primitives/dialog";
import { cn } from "@/components/ui/primitives/utils";

import { FloatingCreateButton } from "./FloatingCreateButton";

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
  footerStart,
  triggerVariant = "default",
  triggerDisabled,
  triggerIcon,
  triggerClassName,
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
  footerStart?: React.ReactNode;
  triggerVariant?: "default" | "floating";
  triggerDisabled?: boolean;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;
  const floatingTrigger =
    triggerVariant === "floating" ? (
      <DialogTrigger asChild>
        <FloatingCreateButton
          disabled={triggerDisabled}
          label={triggerLabel}
          icon={triggerIcon}
          className={triggerClassName}
        />
      </DialogTrigger>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {hideTrigger ? null : triggerVariant === "floating" ? (
        typeof document === "undefined" ? floatingTrigger : createPortal(floatingTrigger, document.body)
      ) : (
        <DialogTrigger asChild>
          {
            <Button disabled={triggerDisabled} className={triggerClassName}>
              {triggerLabel}
            </Button>
          }
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
            {footerStart ? <div className="mr-auto">{footerStart}</div> : null}
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

