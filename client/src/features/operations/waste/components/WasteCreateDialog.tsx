import * as React from "react";

import type { CompanyOption } from "@/core/app/state/slices/company";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { Input } from "@/components/ui/primitives/input";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";

import { createWasteRecord, uploadWasteAttachment } from "../services/api";
import {
  WasteFormFields,
  createWasteFormState,
  toWasteRecordInput,
  validateWasteForm,
} from "./WasteFormFields";

export function WasteCreateDialog({
  companies,
  initialCompanyId,
  onCreated,
  floating,
}: {
  companies: CompanyOption[];
  initialCompanyId?: string;
  onCreated: () => void;
  floating?: boolean;
}) {
  const { userId } = useUser();
  const [form, setForm] = React.useState(() => createWasteFormState({ facilityId: initialCompanyId }));
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    setForm(createWasteFormState({ facilityId: initialCompanyId }));
    setAttachmentFile(null);
  }, [initialCompanyId]);

  return (
    <CreateActionDialog
      title="Create waste log"
      triggerLabel="Create waste log"
      triggerVariant={floating ? "floating" : "default"}
      onCreate={async () => {
        const validationError = validateWasteForm(form);
        if (validationError) return toast.error(validationError), false;

        try {
          const created = await createWasteRecord(userId, toWasteRecordInput(form));
          if (attachmentFile) {
            await uploadWasteAttachment(userId, {
              recordId: created.id,
              file: attachmentFile,
            });
          }

          toast.success("Waste log created");
          setForm(createWasteFormState({ facilityId: form.companyId }));
          setAttachmentFile(null);
          onCreated();
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Create failed.");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <WasteFormFields form={form} setForm={setForm} companies={companies} />
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Manifest / disposal PDF</div>
          <Input type="file" accept="application/pdf" onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)} />
          <div className="text-muted-foreground text-xs">
            {attachmentFile ? `Selected: ${attachmentFile.name}` : "Optional PDF attachment"}
          </div>
        </div>
      </div>
    </CreateActionDialog>
  );
}
