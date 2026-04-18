import * as React from "react";
import { toast } from "sonner";
import { auditTemplates } from "@/data/audit-templates";
import { facilities } from "@/data/mock";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { SelectFilter } from "@/components/SelectFilter";
import { StatusBadge } from "@/components/StatusBadge";
import type { AuditRecord } from "@/types/audit";
import { AUDITORS } from "../audit.constants";
import { computeChecklistStats, defaultStatusesForTemplate } from "../audit.helpers";
export function AuditCreateDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (record: AuditRecord) => void;
}) {
  const [name, setName] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string>("");
  const [templateId, setTemplateId] = React.useState<string>(
    auditTemplates[0]?.id ?? "tmpl_iso14001_ems",
  );
  const [auditor, setAuditor] = React.useState<string>("");
  const [date, setDate] = React.useState<string>("");
  React.useEffect(() => {
    if (!open) return;
    setName("");
    setFacilityId(facilities[0]?.id ?? "");
    setTemplateId(auditTemplates[0]?.id ?? "tmpl_iso14001_ems");
    setAuditor(String(AUDITORS[0] ?? ""));
    setDate("");
  }, [open]);
  const stats = React.useMemo(() => {
    const statuses = defaultStatusesForTemplate(templateId);
    return computeChecklistStats(templateId, statuses);
  }, [templateId]);

  return (
    <CreateActionDialog
      title="Create audit"
      submitLabel="Create"
      open={open}
      onOpenChange={onOpenChange}
      onCreate={() => {
        if (!name.trim()) {
          toast.error("Audit name is required");
          return false;
        }
        if (!facilityId) {
          toast.error("Select a factory");
          return false;
        }
        if (!auditor) {
          toast.error("Select an auditor");
          return false;
        }

        const now = new Date();
        const statusesByItemId = defaultStatusesForTemplate(templateId);
        const computed = computeChecklistStats(templateId, statusesByItemId);
        const checklist = Object.entries(statusesByItemId).map(([itemId, status]) => ({
          itemId,
          status,
          evidenceCount: 0,
        }));

        const record: AuditRecord = {
          id: `audit_${Date.now()}`,
          facilityId,
          name: name.trim(),
          date: date.trim(),
          auditor,
          progress: computed.progress,
          overallScore: computed.score,
          findingsCount: { minor: 0, major: 0, critical: 0 },
          templateId,
          createdAt: now.toISOString(),
          checklist,
          findings: [],
        };

        onCreate(record);
        toast.success("Audit created (mock)");
        return true;
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Audit name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ISO 14001 internal audit" />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Factory</div>
          <SelectFilter
            value={facilityId}
            onChange={(v) => setFacilityId(v ?? "")}
            placeholder="Select factory"
            items={facilities.map((f) => ({ value: f.id, label: f.name }))}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Auditor</div>
          <SelectFilter
            value={auditor}
            onChange={(v) => setAuditor(v ?? "")}
            placeholder="Select auditor"
            items={AUDITORS.map((a) => ({ value: a, label: a }))}
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Template</div>
          <SelectFilter
            value={templateId}
            onChange={(v) => setTemplateId(v ?? "")}
            placeholder="Select template"
            items={auditTemplates.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Schedule date</div>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
      </div>
    </CreateActionDialog>
  );
}
