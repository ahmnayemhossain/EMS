import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Textarea } from "@/components/ui/primitives/textarea";
import { SelectFilter } from "@/components/forms/SelectFilter";
import type { Document } from "@/core/types/models/ems";

import { DOCUMENT_CATEGORIES } from "@/features/assurance/documents/config/constants";

type CompanyOption = {
  id: string;
  name: string;
};

type DocumentCreateDialogProps = {
  companies: CompanyOption[];
  open: boolean;
  title: string;
  facilityId: string;
  category: Document["category"];
  ownerDepartment: string;
  expiresOn: string;
  notes: string;
  file: File | null;
  onOpenChange: (open: boolean) => void;
  onTitleChange: (value: string) => void;
  onFacilityIdChange: (value: string) => void;
  onCategoryChange: (value: Document["category"]) => void;
  onOwnerDepartmentChange: (value: string) => void;
  onExpiresOnChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onFileChange: (value: File | null) => void;
  onCreate: () => Promise<boolean>;
};

export function DocumentCreateDialog(props: DocumentCreateDialogProps) {
  return (
    <CreateActionDialog
      title="Upload document"
      triggerLabel="Upload document"
      triggerVariant="floating"
      submitLabel="Create"
      open={props.open}
      onOpenChange={props.onOpenChange}
      onCreate={props.onCreate}
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label>Company</Label>
          <SelectFilter
            value={props.facilityId}
            onChange={(value) => props.onFacilityIdChange(value ?? "")}
            placeholder="Select company"
            items={props.companies.map((company) => ({ value: company.id, label: company.name }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Title</Label>
          <Input value={props.title} onChange={(event) => props.onTitleChange(event.target.value)} placeholder="Document title" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <SelectFilter
              value={props.category}
              onChange={(value) => props.onCategoryChange((value as Document["category"]) || "permit")}
              placeholder="Select category"
              items={DOCUMENT_CATEGORIES}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Owner department</Label>
            <Input
              value={props.ownerDepartment}
              onChange={(event) => props.onOwnerDepartmentChange(event.target.value)}
              placeholder="e.g. EHS / Admin"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Expiry date</Label>
          <Input type="date" value={props.expiresOn} onChange={(event) => props.onExpiresOnChange(event.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>File</Label>
          <Input type="file" onChange={(event) => props.onFileChange(event.target.files?.[0] ?? null)} />
        </div>
        <div className="grid gap-1.5">
          <Label>Notes</Label>
          <Textarea value={props.notes} onChange={(event) => props.onNotesChange(event.target.value)} placeholder="Optional notes" />
        </div>
      </div>
    </CreateActionDialog>
  );
}
