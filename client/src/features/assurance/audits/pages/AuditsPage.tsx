import * as React from "react";

import { useSelectedCompany } from "@/core/app/state/slices/company";

import { AuditCreateDialog } from "../components/core/AuditCreateDialog";
import { AuditsOverviewTab } from "../components/core/AuditsOverviewTab";
import { useAuditsPage } from "../hooks/use-audits-page";

export function AuditsPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const page = useAuditsPage(selectedCompanyId || undefined);

  return (
    <div className="space-y-6">
      <AuditCreateDialog
        open={page.createOpen}
        onOpenChange={page.setCreateOpen}
        facilities={companies}
        onCreate={page.createRecord}
      />

      {page.loading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Loading audits...</div>
      ) : (
        <AuditsOverviewTab records={page.records} companyCount={companies.length} />
      )}
    </div>
  );
}
