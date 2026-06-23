import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { formatDate } from "@/core/utils/format";
import { useAuditCalendarPage } from "@/features/overview/audit-calendar/hooks/use-audit-calendar-page";
import { AuditCalendarView } from "@/features/overview/audit-calendar/pages/calendar-view";
import { AuditDetailContent } from "@/features/overview/audit-calendar/pages/detail-panel-content";
import { AuditCalendarToolbar } from "@/features/overview/audit-calendar/pages/toolbar";
import { CreateAuditDialog } from "@/features/overview/audit-calendar/pages/create-audit-dialog";
import { UpcomingListView } from "@/features/overview/audit-calendar/pages/upcoming-list-view";

export function AuditCalendarPage() {
  const vm = useAuditCalendarPage();
  const selectedDescription = vm.selectedDateKey ? `${vm.auditsForSelectedKey.length} scheduled` : undefined;

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col gap-4">
      <AuditCalendarToolbar
        view={vm.view}
        month={vm.anchorMonth}
        onViewChange={vm.setView}
        onShift={vm.shiftWindow}
        action={
          <CreateAuditDialog
            open={vm.createOpen}
            companies={vm.companies}
            auditorOptions={vm.availableAuditors}
            onOpenChange={vm.setCreateOpen}
            createCompanyId={vm.form.createCompanyId}
            createTemplateId={vm.form.createTemplateId}
            createAuditor={vm.form.createAuditor}
            createCustomerName={vm.form.createCustomerName}
            createDate={vm.form.createDate}
            onChange={(key, value) => vm.setForm((current) => ({ ...current, [key]: value }))}
            onCreate={vm.createAudit}
          />
        }
      />
      {vm.view === "calendar" ? (
        <AuditCalendarView
          month={vm.anchorMonth}
          selectedDateKey={vm.selectedDateKey}
          todayKey={vm.todayKey}
          countsByDate={vm.countsByDate}
          scheduled={vm.scheduled}
          getTone={(key) => toneForDay(vm.countsByDate, key, vm.todayKey)}
          getLabel={(key) => labelForDay(vm.countsByDate, key, vm.todayKey)}
          onSelectDay={(key, hasCount) => {
            if (!hasCount) {
              vm.setForm((current) => ({ ...current, createDate: key }));
              vm.setCreateOpen(true);
              return;
            }
            vm.setSelectedDateKey(key);
          }}
        />
      ) : (
        <UpcomingListView
          rows={vm.filteredUpcoming}
          upcomingCount={vm.upcoming.length}
          query={vm.listQuery}
          filter={vm.listFilter}
          onQueryChange={vm.setListQuery}
          onFilterChange={vm.setListFilter}
          onSelectDate={vm.setSelectedDateKey}
        />
      )}
      <DetailPanel
        open={Boolean(vm.selectedDateKey && vm.auditsForSelectedKey.length)}
        onOpenChange={(open) => !open && vm.setSelectedDateKey(null)}
        title={vm.selectedDateKey ? `Audits • ${formatDate(vm.selectedDateKey)}` : "Audits"}
        description={selectedDescription}
      >
        {vm.selectedDateKey && vm.auditsForSelectedKey.length ? <AuditDetailContent audits={vm.auditsForSelectedKey} /> : null}
      </DetailPanel>
    </div>
  );
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
