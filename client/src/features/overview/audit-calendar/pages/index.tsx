import { startOfMonth } from "date-fns";

import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { formatDate } from "@/core/utils/format";
import { AuditCalendarView } from "@/features/overview/audit-calendar/pages/calendar-view";
import { CreateAuditDialog } from "@/features/overview/audit-calendar/pages/create-audit-dialog";
import { AuditDetailContent } from "@/features/overview/audit-calendar/pages/detail-panel-content";
import { toPickerDate } from "@/features/overview/audit-calendar/config/helpers";
import { AuditCalendarToolbar } from "@/features/overview/audit-calendar/pages/toolbar";
import { UpcomingListView } from "@/features/overview/audit-calendar/pages/upcoming-list-view";
import { useAuditCalendarPage } from "@/features/overview/audit-calendar/hooks/use-audit-calendar-page";

export function AuditCalendarPage() {
  const vm = useAuditCalendarPage();
  const selectedDescription = vm.selectedDateKey ? `${vm.auditsForSelectedKey.length} scheduled` : undefined;

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-4">
      <AuditCalendarToolbar view={vm.view} month={vm.anchorMonth} onViewChange={vm.setView} onShift={vm.shiftWindow} action={<CreateAuditDialog open={vm.createOpen} companies={vm.facilities} computedEndTime={vm.computedEndTime} createHasConflict={vm.createHasConflict} onOpenChange={vm.setCreateOpen} createCompanyId={vm.form.createCompanyId} createName={vm.form.createName} createAuditor={vm.form.createAuditor} createDate={vm.form.createDate} createStartTime={vm.form.createStartTime} createDuration={vm.form.createDuration} createNotes={vm.form.createNotes} onChange={(key, value) => vm.setForm((current) => ({ ...current, [key]: value }))} onCreate={() => createAudit(vm)} />} />
      {vm.view === "calendar" ? <AuditCalendarView month={vm.anchorMonth} selectedDateKey={vm.selectedDateKey} todayKey={vm.todayKey} countsByDate={vm.countsByDate} scheduled={vm.scheduled} getTone={(key) => toneForDay(vm.countsByDate, key, vm.todayKey)} getLabel={(key) => labelForDay(vm.countsByDate, key, vm.todayKey)} onSelectDay={(key, hasCount) => { if (!hasCount) { vm.setForm((current) => ({ ...current, createDate: key })); vm.setCreateOpen(true); return; } vm.setSelectedDateKey(key); }} /> : <UpcomingListView rows={vm.filteredUpcoming} upcomingCount={vm.upcoming.length} query={vm.listQuery} filter={vm.listFilter} onQueryChange={vm.setListQuery} onFilterChange={vm.setListFilter} onSelectDate={vm.setSelectedDateKey} />}
      <DetailPanel open={Boolean(vm.selectedDateKey && vm.auditsForSelectedKey.length)} onOpenChange={(open) => !open && vm.setSelectedDateKey(null)} title={vm.selectedDateKey ? `Audits ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${formatDate(vm.selectedDateKey)}` : "Audits"} description={selectedDescription}>{vm.selectedDateKey && vm.auditsForSelectedKey.length ? <AuditDetailContent audits={vm.auditsForSelectedKey} /> : null}</DetailPanel>
    </div>
  );
}

function createAudit(vm: ReturnType<typeof useAuditCalendarPage>) {
  if (!vm.form.createCompanyId || !vm.form.createName || !vm.form.createAuditor || !vm.form.createDate) return false;
  const newAudit = { id: `audit_${Date.now()}`, facilityId: vm.form.createCompanyId, name: vm.form.createName, date: vm.form.createDate, auditor: vm.form.createAuditor, progress: 0, overallScore: 0, findingsCount: { minor: 0, major: 0, critical: 0 }, time: vm.form.createStartTime && vm.computedEndTime ? { start: vm.form.createStartTime, end: vm.computedEndTime } : undefined };
  vm.setScheduled((prev) => [newAudit, ...prev]);
  vm.setAnchorMonth(startOfMonth(toPickerDate(vm.form.createDate)));
  vm.setSelectedDateKey(vm.form.createDate);
  vm.setForm((current) => ({ ...current, createNotes: "" }));
  vm.setView("calendar");
  return true;
}

function toneForDay(countsByDate: Map<string, number>, key: string, todayKey: string) {
  if (!countsByDate.has(key)) return null;
  if (key < todayKey) return "critical" as const;
  if (key === todayKey) return "warning" as const;
  return "info" as const;
}

function labelForDay(countsByDate: Map<string, number>, key: string, todayKey: string) {
  const count = countsByDate.get(key) ?? 0;
  if (!count) return null;
  if (key < todayKey) return count === 1 ? "Missed" : `Missed (${count})`;
  if (key === todayKey) return count === 1 ? "Today" : `Today (${count})`;
  return count === 1 ? "Scheduled" : `Scheduled (${count})`;
}

