import { AuditChecklistPreview } from "./AuditChecklistPreview";
import { AuditCreateFields } from "./AuditCreateFields";
import { AuditFindingsDraft } from "./AuditFindingsDraft";
import type { FindingDraft } from "./auditCreate.types";

export function AuditCreateForm({
  facilities,
  auditTemplates,
  stats,
  name,
  onNameChange,
  facilityId,
  onFacilityIdChange,
  auditor,
  onAuditorChange,
  customerName,
  onCustomerNameChange,
  date,
  onDateChange,
  nextAuditDate,
  onNextAuditDateChange,
  templateId,
  onTemplateIdChange,
  findingsDrafts,
  onFindingsDraftsChange,
}: {
  facilities: Array<{ id: string; name: string }>;
  auditTemplates: Array<{ id: string; name: string }>;
  stats: { total: number; progress: number; score: number; template: { name: string } };
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
  findingsDrafts: FindingDraft[];
  onFindingsDraftsChange: (next: FindingDraft[]) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <AuditCreateFields {...{ facilities, auditTemplates, name, onNameChange, facilityId, onFacilityIdChange, auditor, onAuditorChange, customerName, onCustomerNameChange, date, onDateChange, nextAuditDate, onNextAuditDateChange, templateId, onTemplateIdChange }} />
      <AuditChecklistPreview stats={stats} />

      <AuditFindingsDraft value={findingsDrafts} onChange={onFindingsDraftsChange} />
    </div>
  );
}
