import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { auditTemplates, auditors, durationOptions } from "@/features/overview/audit-calendar/config/constants";

export function CreateAuditDialog(props: {
  open: boolean;
  createCompanyId: string;
  createName: string;
  createAuditor: string;
  createDate: string;
  createStartTime: string;
  createDuration: string;
  createNotes: string;
  computedEndTime?: string;
  createHasConflict: boolean;
  companies: Array<{ id: string; name: string }>;
  onOpenChange: (open: boolean) => void;
  onCreate: () => boolean;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <CreateActionDialog title="Add audit" triggerLabel="Add audit" open={props.open} onOpenChange={props.onOpenChange} submitDisabled={props.createHasConflict} onCreate={props.onCreate}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Company"><SelectFilter value={props.createCompanyId} onChange={(value) => props.onChange("createCompanyId", value)} placeholder="Select company" items={props.companies.map((company) => ({ value: company.id, label: company.name }))} /></Field>
        <Field label="Audit name"><SelectFilter value={props.createName} onChange={(value) => props.onChange("createName", value)} placeholder="Select template" items={auditTemplates.map((item) => ({ value: item, label: item }))} /></Field>
        <Field label="Auditor"><SelectFilter value={props.createAuditor} onChange={(value) => props.onChange("createAuditor", value)} placeholder="Select auditor" items={auditors.map((item) => ({ value: item, label: item }))} /></Field>
        <Field label="Date"><Input type="date" value={props.createDate} onChange={(event) => props.onChange("createDate", event.target.value)} /></Field>
        <Field label="Start time"><Input type="time" value={props.createStartTime} onChange={(event) => props.onChange("createStartTime", event.target.value)} /></Field>
        <DurationField duration={props.createDuration} computedEndTime={props.computedEndTime} conflict={props.createHasConflict} onChange={(value) => props.onChange("createDuration", value)} />
        <Field label="Notes" className="sm:col-span-2"><Textarea value={props.createNotes} onChange={(event) => props.onChange("createNotes", event.target.value)} placeholder="Optional notes (mock UI)" /></Field>
      </div>
    </CreateActionDialog>
  );
}

function Field(props: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={`grid gap-1.5 ${props.className || ""}`}><div className="text-muted-foreground text-xs">{props.label}</div>{props.children}</div>;
}

function DurationField(props: { duration: string; computedEndTime?: string; conflict: boolean; onChange: (value: string) => void }) {
  return <Field label="Duration"><SelectFilter value={props.duration} onChange={props.onChange} placeholder="Duration" items={durationOptions.map((value) => ({ value, label: `${value} min` }))} /><div className="text-muted-foreground text-xs tabular-nums">Ends at {props.computedEndTime ?? "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}</div>{props.conflict ? <div className="text-destructive text-xs font-medium">Time overlaps another audit for this day.</div> : null}</Field>;
}

