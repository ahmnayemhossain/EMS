import { Input } from "@/components/ui/primitives/input";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { auditTemplates } from "@/core/data/catalog/audit-templates";

export function CreateAuditDialog(props: {
  open: boolean;
  createCompanyId: string;
  createTemplateId: string;
  createAuditor: string;
  createCustomerName: string;
  createDate: string;
  companies: Array<{ id: string; name: string }>;
  auditorOptions: string[];
  onOpenChange: (open: boolean) => void;
  onCreate: () => boolean | Promise<boolean>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <CreateActionDialog
      title="Add audit"
      triggerLabel="Add audit"
      triggerVariant="floating"
      open={props.open}
      onOpenChange={props.onOpenChange}
      onCreate={props.onCreate}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Company">
          <SelectFilter
            value={props.createCompanyId}
            onChange={(value) => props.onChange("createCompanyId", value)}
            placeholder="Select company"
            items={props.companies.map((company) => ({ value: company.id, label: company.name }))}
          />
        </Field>
        <Field label="Template">
          <SelectFilter
            value={props.createTemplateId}
            onChange={(value) => props.onChange("createTemplateId", value)}
            placeholder="Select template"
            items={auditTemplates.map((template) => ({ value: template.id, label: template.name }))}
          />
        </Field>
        <Field label="Auditor">
          <SelectFilter
            value={props.createAuditor}
            onChange={(value) => props.onChange("createAuditor", value)}
            placeholder="Select auditor"
            items={props.auditorOptions.map((auditor) => ({ value: auditor, label: auditor }))}
          />
        </Field>
        <Field label="Date">
          <Input type="date" value={props.createDate} onChange={(event) => props.onChange("createDate", event.target.value)} />
        </Field>
        <Field label="Customer / scope" className="sm:col-span-2">
          <Input
            value={props.createCustomerName}
            onChange={(event) => props.onChange("createCustomerName", event.target.value)}
            placeholder="Optional"
          />
        </Field>
      </div>
    </CreateActionDialog>
  );
}

function Field(props: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`grid gap-1.5 ${props.className || ""}`}>
      <div className="text-muted-foreground text-xs">{props.label}</div>
      {props.children}
    </div>
  );
}
