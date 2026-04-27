import * as React from "react";
import { toast } from "@/app/lib/toast";

import { auditTemplates } from "@/data/audit-templates";
import { facilities } from "@/data/mock";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import type { AuditRecord } from "@/types/audit";

import { AUDITORS } from "../audit.constants";
import { computeChecklistStats, defaultStatusesForTemplate } from "../audit.helpers";
import { AuditCreateForm } from "./AuditCreateForm";
import { buildAuditRecord, buildFindings } from "./auditCreate.helpers";
import type { FindingDraft } from "./auditCreate.types";

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
  const [customerName, setCustomerName] = React.useState<string>("");
  const [date, setDate] = React.useState<string>("");
  const [nextAuditDate, setNextAuditDate] = React.useState<string>("");
  const [findingsDrafts, setFindingsDrafts] = React.useState<FindingDraft[]>([]);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setFacilityId(facilities[0]?.id ?? "");
    setTemplateId(auditTemplates[0]?.id ?? "tmpl_iso14001_ems");
    setAuditor(String(AUDITORS[0] ?? ""));
    setCustomerName("");
    setDate("");
    setNextAuditDate("");
    setFindingsDrafts([]);
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
      contentClassName="sm:max-w-3xl max-h-[85vh] overflow-y-auto"
      onCreate={() => {
        if (!name.trim()) return toast.error("Audit name is required"), false;
        if (!facilityId) return toast.error("Select a factory"), false;
        if (!auditor) return toast.error("Select an auditor"), false;

        const now = new Date();
        const statusesByItemId = defaultStatusesForTemplate(templateId);
        const computed = computeChecklistStats(templateId, statusesByItemId);
        const checklist = Object.entries(statusesByItemId).map(([itemId, status]) => ({
          itemId,
          status,
          evidenceCount: 0,
        }));
        const findings = buildFindings({ drafts: findingsDrafts, fallbackCustomerName: customerName });
        const record = buildAuditRecord({
          id: `audit_${Date.now()}`,
          nowIso: now.toISOString(),
          facilityId,
          name,
          customerName,
          date,
          nextAuditDate,
          auditor,
          templateId,
          progress: computed.progress,
          overallScore: computed.score,
          checklist,
          findings,
        });
        onCreate(record);
        toast.success("Audit created (mock)");
        return true;
      }}
    >
      <AuditCreateForm
        facilities={facilities}
        auditTemplates={auditTemplates}
        stats={stats}
        name={name}
        onNameChange={setName}
        facilityId={facilityId}
        onFacilityIdChange={setFacilityId}
        auditor={auditor}
        onAuditorChange={setAuditor}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        date={date}
        onDateChange={setDate}
        nextAuditDate={nextAuditDate}
        onNextAuditDateChange={setNextAuditDate}
        templateId={templateId}
        onTemplateIdChange={setTemplateId}
        findingsDrafts={findingsDrafts}
        onFindingsDraftsChange={setFindingsDrafts}
      />
    </CreateActionDialog>
  );
}

