import * as React from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { buttonVariants } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

type ActionModalTone = "default" | "destructive" | "warning" | "success";

const toneMeta = {
  default: {
    icon: HelpCircle,
    iconClass: "border-primary/20 bg-primary/10 text-primary",
    actionVariant: "default" as const,
  },
  destructive: {
    icon: Trash2,
    iconClass: "border-destructive/20 bg-destructive/10 text-destructive",
    actionVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClass:
      "border-[color-mix(in_oklab,var(--warning-600)_24%,var(--border))] bg-[var(--warning-50)] text-[var(--warning-700)]",
    actionVariant: "default" as const,
  },
  success: {
    icon: CheckCircle2,
    iconClass:
      "border-[color-mix(in_oklab,var(--success-600)_24%,var(--border))] bg-[var(--success-50)] text-[var(--success-700)]",
    actionVariant: "default" as const,
  },
};

export function ActionModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  confirming = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ActionModalTone;
  confirming?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);

  const isBusy = confirming || busy;
  const meta = toneMeta[tone];
  const Icon = meta.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[min(92vw,440px)] gap-5 rounded-2xl border bg-background/95 p-5 text-center shadow-2xl backdrop-blur sm:p-6">
        <AlertDialogHeader className="items-center text-center">
          <div
            className={cn(
              "mb-1 flex size-12 items-center justify-center rounded-full border",
              meta.iconClass,
            )}
          >
            <Icon className="size-5" />
          </div>
          <AlertDialogTitle className="text-balance text-lg font-semibold">
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className="max-w-[34rem] text-balance text-sm leading-6">
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-center">
          <AlertDialogCancel disabled={isBusy} className="mt-0">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isBusy}
            onClick={async (e) => {
              // Prevent immediate close if caller wants async confirm.
              e.preventDefault();
              try {
                setBusy(true);
                await onConfirm();
                onOpenChange(false);
              } finally {
                setBusy(false);
              }
            }}
            className={cn(
              buttonVariants({ variant: meta.actionVariant }),
              "min-w-24",
            )}
          >
            {isBusy ? "Working..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
