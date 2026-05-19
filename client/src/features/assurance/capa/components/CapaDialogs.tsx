import * as React from "react";

import { ActionModal } from "@/components/feedback/ActionModal";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { Button } from "@/components/ui/primitives/button";
import { useCurrentUser } from "@/core/app/state/slices/user";
import type { CAPA } from "@/core/types/models/ems";

import { CapaForm } from "./CapaForm";
import type { CapaInput } from "../services/api";

type CapaDialogErrors = Partial<Record<keyof CapaInput, string>>;

export function CreateCapaDialog(props: {
  companyId?: string;
  companyName: string;
  onCreate: (value: CapaInput) => Promise<void>;
  floating?: boolean;
}) {
  const currentUser = useCurrentUser();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<CapaInput>(() => createDraft(props.companyId, currentUser.name));
  const [errors, setErrors] = React.useState<CapaDialogErrors>({});

  React.useEffect(() => {
    setDraft(createDraft(props.companyId, currentUser.name));
    setErrors({});
  }, [currentUser.name, props.companyId]);

  return (
    <CreateActionDialog
      title="Create CAPA"
      triggerLabel="Create CAPA"
      triggerVariant={props.floating ? "floating" : "default"}
      submitLabel="Create"
      contentClassName="sm:max-w-2xl"
      submitDisabled={!props.companyId}
      triggerDisabled={!props.companyId}
      open={props.floating ? open : undefined}
      onOpenChange={props.floating ? setOpen : undefined}
      onCreate={async () => {
        const nextErrors = validateDraft(draft);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return false;
        await props.onCreate(draft);
        setDraft(createDraft(props.companyId, currentUser.name));
      }}
    >
      <CapaForm companyName={props.companyName} value={draft} onChange={setDraft} errors={errors} />
    </CreateActionDialog>
  );
}

export function EditCapaDialog(props: {
  companyName: string;
  item: CAPA | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, value: CapaInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  canDelete?: boolean;
}) {
  const [draft, setDraft] = React.useState<CapaInput | null>(null);
  const [errors, setErrors] = React.useState<CapaDialogErrors>({});

  React.useEffect(() => {
    setDraft(props.item ? toDraft(props.item) : null);
    setErrors({});
  }, [props.item]);

  return (
    <CreateActionDialog
      title="Edit CAPA"
      submitLabel="Save"
      open={props.open}
      onOpenChange={props.onOpenChange}
      hideTrigger
      contentClassName="sm:max-w-2xl"
      footerStart={
        props.item && props.canDelete ? (
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await props.onDelete?.(props.item!.id);
              props.onOpenChange(false);
            }}
          >
            Delete
          </Button>
        ) : undefined
      }
      onCreate={async () => {
        if (!props.item || !draft) return false;
        const nextErrors = validateDraft(draft);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return false;
        await props.onSave(props.item.id, draft);
      }}
    >
      {draft ? <CapaForm companyName={props.companyName} value={draft} onChange={setDraft} errors={errors} /> : null}
    </CreateActionDialog>
  );
}

export function DeleteCapaDialog(props: {
  item: CAPA | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void>;
}) {
  return (
    <ActionModal
      open={props.open}
      onOpenChange={props.onOpenChange}
      tone="destructive"
      title="Delete this CAPA?"
      description="This will permanently remove the corrective action from the board."
      confirmLabel="Delete"
      onConfirm={async () => {
        if (!props.item) return;
        await props.onConfirm(props.item.id);
      }}
    />
  );
}

function createDraft(companyId: string | undefined, owner: string): CapaInput {
  return {
    facilityId: companyId ?? "",
    title: "",
    description: "",
    owner,
    severity: "major",
    status: "open",
    dueDate: new Date().toISOString().slice(0, 10),
    evidenceCount: 0,
    relatedFindingId: "",
  };
}

function toDraft(item: CAPA): CapaInput {
  return {
    facilityId: item.facilityId,
    title: item.title,
    description: item.description ?? "",
    owner: item.owner,
    severity: item.severity,
    status: item.status,
    dueDate: item.dueDate,
    evidenceCount: item.evidenceCount,
    relatedFindingId: item.relatedFindingId ?? "",
  };
}

function validateDraft(value: CapaInput) {
  const errors: CapaDialogErrors = {};
  if (!value.facilityId) errors.facilityId = "Company is required.";
  if (!value.title.trim()) errors.title = "Title is required.";
  if (!value.owner.trim()) errors.owner = "Owner is required.";
  if (!value.dueDate) errors.dueDate = "Due date is required.";
  return errors;
}
