import * as React from "react";

import type { CompanyOption } from "@/core/app/state/slices/company";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { Input } from "@/components/ui/primitives/input";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";

import { createWastewaterRecord, uploadWastewaterLabReport } from "../services/api";
import {
  WastewaterFormFields,
  createWastewaterFormState,
  toWastewaterRecordInput,
  validateWastewaterForm,
} from "./WastewaterFormFields";

export function WastewaterCreateDialog({
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
  const [form, setForm] = React.useState(() => createWastewaterFormState({ facilityId: initialCompanyId }));
  const [reportFile, setReportFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    setForm(createWastewaterFormState({ facilityId: initialCompanyId }));
    setReportFile(null);
  }, [initialCompanyId]);

  return (
    <CreateActionDialog
      title="Create lab record"
      triggerLabel="Create lab record"
      triggerVariant={floating ? "floating" : "default"}
      onCreate={async () => {
        const validationError = validateWastewaterForm(form);
        if (validationError) return toast.error(validationError), false;

        try {
          const created = await createWastewaterRecord(userId, toWastewaterRecordInput(form));
          if (reportFile) {
            await uploadWastewaterLabReport(userId, {
              recordId: created.id,
              file: reportFile,
            });
          }

          toast.success("Lab record created");
          setForm(createWastewaterFormState({ facilityId: form.companyId }));
          setReportFile(null);
          onCreated();
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Create failed.");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <WastewaterFormFields form={form} setForm={setForm} companies={companies} />
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Lab report PDF</div>
          <Input type="file" accept="application/pdf" onChange={(event) => setReportFile(event.target.files?.[0] || null)} />
          <div className="text-muted-foreground text-xs">
            {reportFile ? `Selected: ${reportFile.name}` : "Optional PDF attachment"}
          </div>
        </div>
      </div>
    </CreateActionDialog>
  );
}
