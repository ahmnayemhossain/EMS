import { ActionModal } from "@/core/components/ActionModal";

import type { ComplaintBoxAction } from "@/features/ComplaintBoxPage/complaint-box.types";

export function ComplaintBoxActionModal({
  action,
  onClose,
  onConfirm,
}: {
  action: ComplaintBoxAction;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ActionModal
      open={Boolean(action)}
      onOpenChange={(open) => (!open ? onClose() : null)}
      tone="destructive"
      title={getActionTitle(action)}
      description={getActionDescription(action)}
      confirmLabel={action?.kind === "delete-complaint" ? "Delete" : "Remove"}
      onConfirm={onConfirm}
    />
  );
}

function getActionTitle(action: ComplaintBoxAction) {
  if (action?.kind === "delete-complaint") return "Delete this complaint?";
  if (action?.kind === "remove-record") return "Remove this record?";
  return "Confirm action";
}

function getActionDescription(action: ComplaintBoxAction) {
  if (action?.kind === "delete-complaint") {
    return "This removes it from the UI and deletes the inbox copy when available.";
  }
  if (action?.kind === "remove-record") {
    return "This removes the saved record. The complaint stays unchanged.";
  }
  return undefined;
}
