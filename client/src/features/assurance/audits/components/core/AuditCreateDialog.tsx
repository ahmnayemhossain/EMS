import * as React from "react";

import { auditTemplates } from "@/core/data/catalog/audit-templates";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import type { AuditRecord } from "@/core/types/models/audit";

import { AuditCreateForm } from "./AuditCreateForm";
import { createAuditRecord } from "./create-audit-record";
import { useAuditCreateDialog } from "../hooks/use-audit-create-dialog";

export function AuditCreateDialog({
  open,
  onOpenChange,
  onCreate,
  facilities,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (record: AuditRecord) => void | boolean | Promise<void | boolean>;
  facilities: Array<{ id: string; name: string }>;
}) {
  const state = useAuditCreateDialog(open, facilities[0]?.id);

  return (
    <CreateActionDialog
      title="Create audit"
      triggerLabel="Create audit"
      triggerVariant="floating"
      submitLabel="Create"
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="sm:max-w-3xl max-h-[85vh] overflow-y-auto"
      onCreate={() => createAuditRecord({ ...state, onCreate })}
    >
      <AuditCreateForm
        facilities={facilities}
        auditTemplates={auditTemplates}
        stats={state.stats}
        name={state.name}
        onNameChange={state.setName}
        facilityId={state.facilityId}
        onFacilityIdChange={state.setFacilityId}
        auditor={state.auditor}
        onAuditorChange={state.setAuditor}
        customerName={state.customerName}
        onCustomerNameChange={state.setCustomerName}
        date={state.date}
        onDateChange={state.setDate}
        nextAuditDate={state.nextAuditDate}
        onNextAuditDateChange={state.setNextAuditDate}
        templateId={state.templateId}
        onTemplateIdChange={state.setTemplateId}
        findingsDrafts={state.findingsDrafts}
        onFindingsDraftsChange={state.setFindingsDrafts}
      />
    </CreateActionDialog>
  );
}

