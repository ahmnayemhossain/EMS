import * as React from "react";

import { auditTemplates } from "@/core/data/catalog/audit-templates";
import { facilities } from "@/core/data/catalog/mock";
import { AUDITORS } from "../../config/audit.constants";
import { computeChecklistStats, defaultStatusesForTemplate } from "../../config/audit.helpers";
import type { FindingDraft } from "../core/auditCreate.types";

export function useAuditCreateDialog(open: boolean) {
  const [name, setName] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string>("");
  const [templateId, setTemplateId] = React.useState<string>(auditTemplates[0]?.id ?? "tmpl_iso14001_ems");
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

  const stats = React.useMemo(() => computeChecklistStats(templateId, defaultStatusesForTemplate(templateId)), [templateId]);
  return { name, setName, facilityId, setFacilityId, templateId, setTemplateId, auditor, setAuditor, customerName, setCustomerName, date, setDate, nextAuditDate, setNextAuditDate, findingsDrafts, setFindingsDrafts, stats };
}
