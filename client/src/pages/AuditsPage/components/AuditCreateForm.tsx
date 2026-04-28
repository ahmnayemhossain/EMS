import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import { SelectFilter } from "@/components/SelectFilter";
import { StatusBadge } from "@/components/StatusBadge";

import { AUDITORS } from "../audit.constants";
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
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Audit name</div>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. ISO 14001 internal audit"
        />
      </div>

      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Company</div>
        <SelectFilter
          value={facilityId}
          onChange={(v) => onFacilityIdChange(v ?? "")}
          placeholder="Select company"
          items={facilities.map((f) => ({ value: f.id, label: f.name }))}
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Auditor</div>
        <SelectFilter
          value={auditor}
          onChange={(v) => onAuditorChange(v ?? "")}
          placeholder="Select auditor"
          items={AUDITORS.map((a) => ({ value: a, label: a }))}
        />
      </div>

      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Customer</div>
        <Input
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="e.g. Buyer / Internal"
        />
      </div>
      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Audit date</div>
        <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
      </div>

      <div className="grid gap-1.5">
        <div className="text-muted-foreground text-xs">Next audit</div>
        <Input
          type="date"
          value={nextAuditDate}
          onChange={(e) => onNextAuditDateChange(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <div className="text-muted-foreground text-xs">Template</div>
        <SelectFilter
          value={templateId}
          onChange={(v) => onTemplateIdChange(v ?? "")}
          placeholder="Select template"
          items={auditTemplates.map((t) => ({ value: t.id, label: t.name }))}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
        <div>
          <div className="text-sm font-medium">Checklist preview</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Total items {stats.total} • Default score {stats.score}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge tone="neutral">{stats.template.name}</StatusBadge>
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{stats.progress}%</span>
        </div>
        <Progress value={stats.progress} className="mt-2" />
      </div>

      <AuditFindingsDraft value={findingsDrafts} onChange={onFindingsDraftsChange} />
    </div>
  );
}

