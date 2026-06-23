import * as React from "react";
import { addMonths, startOfMonth, subMonths } from "date-fns";

import { toast } from "@/core/app/lib/toast";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { useCurrentUser, useUser } from "@/core/app/state/slices/user";
import { getCompanyName } from "@/core/companies/directory";
import { auditTemplates, getTemplateById } from "@/core/data/catalog/audit-templates";
import { formatUserLabel } from "@/core/users/format-user-label";
import { createAuditRecordApi, listAuditRecords } from "@/features/assurance/audits/services/api";
import { formatAuditListSearch, toDayKey, toPickerDate } from "@/features/overview/audit-calendar/config/helpers";
import type { AuditListFilter, AuditCalendarView, ScheduledAudit } from "@/features/overview/audit-calendar/config/types";

type AuditCalendarFormState = {
  createCompanyId: string;
  createTemplateId: string;
  createAuditor: string;
  createCustomerName: string;
  createDate: string;
};

const defaultTemplateId = auditTemplates[0]?.id ?? "";

export function useAuditCalendarPage() {
  const { userId } = useUser();
  const currentUser = useCurrentUser();
  const currentUserLabel = formatUserLabel(currentUser);
  const { companies, selectedCompanyId } = useSelectedCompany();
  const [scheduled, setScheduled] = React.useState<ScheduledAudit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [anchorMonth, setAnchorMonth] = React.useState<Date>(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = React.useState<string | null>(null);
  const [view, setView] = React.useState<AuditCalendarView>("calendar");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [listQuery, setListQuery] = React.useState("");
  const [listFilter, setListFilter] = React.useState<AuditListFilter>("all");
  const [form, setForm] = React.useState<AuditCalendarFormState>(() => ({
    createCompanyId: "",
    createTemplateId: defaultTemplateId,
    createAuditor: currentUserLabel,
    createCustomerName: "",
    createDate: toDayKey(new Date()),
  }));

  const todayKey = React.useMemo(() => toDayKey(new Date()), []);

  React.useEffect(() => {
    setForm((current) => {
      const nextCompanyId = companies.some((company) => company.id === current.createCompanyId)
        ? current.createCompanyId
        : companies[0]?.id || "";
      const nextTemplateId = current.createTemplateId || defaultTemplateId;
      const nextAuditor = current.createAuditor.trim() || currentUserLabel;

      if (
        nextCompanyId === current.createCompanyId &&
        nextTemplateId === current.createTemplateId &&
        nextAuditor === current.createAuditor
      ) {
        return current;
      }

      return {
        ...current,
        createCompanyId: nextCompanyId,
        createTemplateId: nextTemplateId,
        createAuditor: nextAuditor,
      };
    });
  }, [companies, currentUserLabel]);

  const loadAudits = React.useCallback(async () => {
    if (!userId) {
      setScheduled([]);
      return;
    }

    setLoading(true);
    try {
      const rows = await listAuditRecords(userId, selectedCompanyId || undefined);
      setScheduled(rows);
    } catch (error) {
      setScheduled([]);
      toast.error(error instanceof Error ? error.message : "Could not load audits.");
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId, userId]);

  React.useEffect(() => {
    void loadAudits();
  }, [loadAudits]);

  const countsByDate = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const audit of scheduled) {
      counts.set(audit.date, (counts.get(audit.date) || 0) + 1);
    }
    return counts;
  }, [scheduled]);

  const upcoming = React.useMemo(
    () => scheduled
      .slice()
      .filter((audit) => audit.date >= todayKey)
      .sort((left, right) => left.date.localeCompare(right.date) || left.name.localeCompare(right.name)),
    [scheduled, todayKey],
  );

  const filteredUpcoming = React.useMemo(
    () => filterUpcoming(upcoming, listFilter, listQuery, companies),
    [companies, upcoming, listFilter, listQuery],
  );

  const auditsForSelectedKey = React.useMemo(
    () => !selectedDateKey
      ? []
      : scheduled
        .filter((audit) => audit.date === selectedDateKey)
        .sort((left, right) => left.name.localeCompare(right.name)),
    [scheduled, selectedDateKey],
  );

  const availableAuditors = React.useMemo(() => {
    const seen = new Set<string>();
    const labels: string[] = [];

    const push = (value?: string | null) => {
      const label = String(value || "").trim();
      if (!label) return;
      const key = label.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      labels.push(label);
    };

    push(currentUserLabel);
    for (const audit of scheduled) push(audit.auditor);

    return labels;
  }, [currentUserLabel, scheduled]);

  const createAudit = React.useCallback(async () => {
    const template = getTemplateById(form.createTemplateId);
    if (!userId) return false;
    if (!form.createCompanyId) return toast.error("Select a company"), false;
    if (!template) return toast.error("Select a template"), false;
    if (!form.createAuditor.trim()) return toast.error("Select an auditor"), false;
    if (!form.createDate) return toast.error("Select a date"), false;

    try {
      const created = await createAuditRecordApi(userId, {
        facilityId: form.createCompanyId,
        name: template.name,
        customerName: form.createCustomerName.trim() || undefined,
        date: form.createDate,
        nextAuditDate: undefined,
        auditor: form.createAuditor.trim(),
        templateId: template.id,
        progress: 0,
        overallScore: 0,
        findingsCount: { minor: 0, major: 0, critical: 0 },
        checklist: [],
        findings: [],
      });

      setScheduled((current) => [created, ...current]);
      setAnchorMonth(startOfMonth(toPickerDate(form.createDate)));
      setSelectedDateKey(form.createDate);
      setView("calendar");
      setForm((current) => ({ ...current, createCustomerName: "" }));
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create audit.");
      return false;
    }
  }, [form, userId]);

  return {
    companies,
    scheduled,
    loading,
    anchorMonth,
    selectedDateKey,
    view,
    createOpen,
    listQuery,
    listFilter,
    form,
    countsByDate,
    upcoming,
    filteredUpcoming,
    auditsForSelectedKey,
    todayKey,
    availableAuditors,
    setScheduled,
    setAnchorMonth,
    setSelectedDateKey,
    setView,
    setCreateOpen,
    setListQuery,
    setListFilter,
    setForm,
    createAudit,
    shiftWindow: (dir: "prev" | "next") => setAnchorMonth((current) => (dir === "prev" ? subMonths(current, 1) : addMonths(current, 1))),
  };
}

function filterUpcoming(upcoming: ScheduledAudit[], filter: AuditListFilter, query: string, companies: ReturnType<typeof useSelectedCompany>["companies"]) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return upcoming;
  return upcoming.filter((audit) => matchesFilter(audit, filter, normalizedQuery, companies));
}

function matchesFilter(audit: ScheduledAudit, filter: AuditListFilter, query: string, companies: ReturnType<typeof useSelectedCompany>["companies"]) {
  const company = audit.companyName || getCompanyName(audit.facilityId, companies);
  const allText = formatAuditListSearch(audit.date, company, audit.name, audit.auditor);
  if (filter === "all") return allText.includes(query);
  if (filter === "date") return `${audit.date.toLowerCase()} ${allText}`.includes(query);
  if (filter === "company") return company.toLowerCase().includes(query);
  if (filter === "audit") return audit.name.toLowerCase().includes(query);
  return audit.auditor.toLowerCase().includes(query);
}
