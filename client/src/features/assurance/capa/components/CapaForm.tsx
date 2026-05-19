import { SelectFilter } from "@/components/forms/SelectFilter";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import type { CAPA } from "@/core/types/models/ems";

import type { CapaInput } from "../services/api";

export function CapaForm(props: {
  companyName: string;
  value: CapaInput;
  onChange: (value: CapaInput) => void;
  errors?: Partial<Record<keyof CapaInput, string>>;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Company">
          <Input value={props.companyName} readOnly />
        </Field>
        <Field label="Owner" required error={props.errors?.owner}>
          <Input
            value={props.value.owner}
            onChange={(event) => props.onChange({ ...props.value, owner: event.target.value })}
            className={props.errors?.owner ? "border-destructive ring-1 ring-destructive/35" : ""}
            placeholder="Responsible person"
          />
        </Field>
        <Field label="Title" required error={props.errors?.title} className="md:col-span-2">
          <Input
            value={props.value.title}
            onChange={(event) => props.onChange({ ...props.value, title: event.target.value })}
            className={props.errors?.title ? "border-destructive ring-1 ring-destructive/35" : ""}
            placeholder="Corrective action title"
          />
        </Field>
        <Field label="Severity" required error={props.errors?.severity}>
          <SelectFilter
            value={props.value.severity}
            onChange={(value) => props.onChange({ ...props.value, severity: (value || "major") as CAPA["severity"] })}
            placeholder="Severity"
            invalid={Boolean(props.errors?.severity)}
            className="w-full"
            items={[
              { value: "minor", label: "Minor" },
              { value: "major", label: "Major" },
              { value: "critical", label: "Critical" },
            ]}
          />
        </Field>
        <Field label="Status" required error={props.errors?.status}>
          <SelectFilter
            value={props.value.status}
            onChange={(value) => props.onChange({ ...props.value, status: (value || "open") as CAPA["status"] })}
            placeholder="Status"
            invalid={Boolean(props.errors?.status)}
            className="w-full"
            items={[
              { value: "open", label: "Open" },
              { value: "in_progress", label: "In progress" },
              { value: "pending_verification", label: "Pending verification" },
              { value: "closed", label: "Closed" },
              { value: "overdue", label: "Overdue" },
            ]}
          />
        </Field>
        <Field label="Due date" required error={props.errors?.dueDate}>
          <Input
            type="date"
            value={props.value.dueDate}
            onChange={(event) => props.onChange({ ...props.value, dueDate: event.target.value })}
            className={props.errors?.dueDate ? "border-destructive ring-1 ring-destructive/35" : ""}
          />
        </Field>
        <Field label="Evidence count">
          <Input
            type="number"
            min={0}
            value={String(props.value.evidenceCount ?? 0)}
            onChange={(event) =>
              props.onChange({
                ...props.value,
                evidenceCount: Number.isFinite(Number(event.target.value)) ? Math.max(0, Number(event.target.value)) : 0,
              })
            }
          />
        </Field>
        <Field label="Related finding ID">
          <Input
            value={props.value.relatedFindingId ?? ""}
            onChange={(event) => props.onChange({ ...props.value, relatedFindingId: event.target.value })}
            placeholder="Optional"
          />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <Textarea
            value={props.value.description ?? ""}
            onChange={(event) => props.onChange({ ...props.value, description: event.target.value })}
            rows={5}
            placeholder="Root cause, action plan, or verification note"
          />
        </Field>
      </div>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode; required?: boolean; error?: string; className?: string }) {
  return (
    <div className={["grid gap-1.5", props.className || ""].join(" ").trim()}>
      <div className="text-xs font-medium text-muted-foreground">
        {props.label}
        {props.required ? <span className="ml-1 text-destructive">*</span> : null}
      </div>
      {props.children}
      {props.error ? <div className="text-xs text-destructive">{props.error}</div> : null}
    </div>
  );
}
