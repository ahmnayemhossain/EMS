import { Paperclip } from "lucide-react";

import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { utilityAttachmentConfig } from "@/pages/UtilitiesPage/constants";
import { FieldError, FieldLabel, FormSection } from "@/pages/UtilitiesPage/form/form-ui";
import type { UtilityFormProps } from "@/pages/UtilitiesPage/form/types";

export function RemarksAttachmentSection({ props }: { props: UtilityFormProps }) {
  return (
    <FormSection title="Remarks / Attachment">
      <div className="grid gap-3">
        <div className="grid gap-1.5"><FieldLabel>Remarks</FieldLabel><Textarea value={props.remarks} onChange={(event) => props.onRemarksChange(event.target.value)} placeholder="Optional remarks" /></div>
        <div className="grid gap-1.5">
          <FieldLabel>Attachment</FieldLabel>
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 text-sm"><Paperclip className="size-4 shrink-0" /><span className="truncate">{props.attachment?.name ?? "No file selected"}</span></div>
            <Input type="file" className="sm:max-w-[280px]" accept={utilityAttachmentConfig.accept} onChange={(event) => props.onAttachmentChange(event.target.files?.[0] ?? null)} />
          </div>
          <div className="text-muted-foreground text-xs">PDF only, up to 10 MB.</div>
          <FieldError>{props.attachmentError}</FieldError>
        </div>
      </div>
    </FormSection>
  );
}
