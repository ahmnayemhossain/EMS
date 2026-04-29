import { Input } from "@/app/components/ui/input";
import { SelectFilter } from "@/components/SelectFilter";

import { AUDITORS } from "../audit.constants";

export function AuditCreateFields(props: AuditCreateFieldsProps) {
  return (
    <>
      <AuditField label="Audit name" className="sm:col-span-2"><Input value={props.name} onChange={(e) => props.onNameChange(e.target.value)} placeholder="e.g. ISO 14001 internal audit" /></AuditField>
      <AuditField label="Company"><SelectFilter value={props.facilityId} onChange={(value) => props.onFacilityIdChange(value ?? "")} placeholder="Select company" items={props.facilities.map((facility) => ({ value: facility.id, label: facility.name }))} /></AuditField>
      <AuditField label="Auditor"><SelectFilter value={props.auditor} onChange={(value) => props.onAuditorChange(value ?? "")} placeholder="Select auditor" items={AUDITORS.map((auditor) => ({ value: auditor, label: auditor }))} /></AuditField>
      <AuditField label="Customer"><Input value={props.customerName} onChange={(e) => props.onCustomerNameChange(e.target.value)} placeholder="e.g. Buyer / Internal" /></AuditField>
      <AuditField label="Audit date"><Input type="date" value={props.date} onChange={(e) => props.onDateChange(e.target.value)} /></AuditField>
      <AuditField label="Next audit"><Input type="date" value={props.nextAuditDate} onChange={(e) => props.onNextAuditDateChange(e.target.value)} /></AuditField>
      <AuditField label="Template" className="sm:col-span-2"><SelectFilter value={props.templateId} onChange={(value) => props.onTemplateIdChange(value ?? "")} placeholder="Select template" items={props.auditTemplates.map((template) => ({ value: template.id, label: template.name }))} /></AuditField>
    </>
  );
}

function AuditField({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={`grid gap-1.5 ${className ?? ""}`.trim()}><div className="text-muted-foreground text-xs">{label}</div>{children}</div>;
}

type AuditCreateFieldsProps = {
  facilities: Array<{ id: string; name: string }>;
  auditTemplates: Array<{ id: string; name: string }>;
  name: string;
  onNameChange: (next: string) => void;
  facilityId: string;
  onFacilityIdChange: (next: string) => void;
  auditor: string;
  onAuditorChange: (next: string) => void;
  customerName: string;
  onCustomerNameChange: (next: string) => void;
  date: string;
  onDateChange: (next: string) => void;
  nextAuditDate: string;
  onNextAuditDateChange: (next: string) => void;
  templateId: string;
  onTemplateIdChange: (next: string) => void;
};
