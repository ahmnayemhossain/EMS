import * as React from "react";

import { AlertDialog } from "@/core/app/components/ui/alert-dialog";

import { ActionModalContent } from "@/core/components/ActionModalContent";
import type { ActionModalTone } from "@/core/components/action-modal.meta";

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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <ActionModalContent
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        tone={tone}
        isBusy={isBusy}
        onConfirm={async () => {
          try {
            setBusy(true);
            await onConfirm();
            onOpenChange(false);
          } finally {
            setBusy(false);
          }
        }}
      />
    </AlertDialog>
  );
}
