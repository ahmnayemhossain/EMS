import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/app/components/ui/alert-dialog";
import { buttonVariants } from "@/core/app/components/ui/button";
import { cn } from "@/core/app/components/ui/utils";

import { toneMeta, type ActionModalTone } from "@/core/components/action-modal.meta";

export function ActionModalContent({
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone,
  isBusy,
  onConfirm,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: ActionModalTone;
  isBusy: boolean;
  onConfirm: () => Promise<void>;
}) {
  const meta = toneMeta[tone];
  const Icon = meta.icon;
  return (
    <AlertDialogContent className="max-w-[min(92vw,440px)] gap-5 rounded-2xl border bg-background/95 p-5 text-center shadow-2xl backdrop-blur sm:p-6">
      <AlertDialogHeader className="items-center text-center">
        <div className={cn("mb-1 flex size-12 items-center justify-center rounded-full border", meta.iconClass)}>
          <Icon className="size-5" />
        </div>
        <AlertDialogTitle className="text-balance text-lg font-semibold">{title}</AlertDialogTitle>
        {description ? <AlertDialogDescription className="max-w-[34rem] text-balance text-sm leading-6">{description}</AlertDialogDescription> : null}
      </AlertDialogHeader>
      <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-center">
        <AlertDialogCancel disabled={isBusy} className="mt-0">{cancelLabel}</AlertDialogCancel>
        <AlertDialogAction disabled={isBusy} onClick={onConfirm} className={cn(buttonVariants({ variant: meta.actionVariant }), "min-w-24")}>
          {isBusy ? "Working..." : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
