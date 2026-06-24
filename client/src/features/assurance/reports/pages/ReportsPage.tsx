import * as React from "react";

import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { Badge } from "@/components/ui/primitives/badge";
import { useSelectedCompany } from "@/core/app/state/slices/company";
import { ReportGridCard } from "@/features/assurance/reports/components/ReportGridCard";
import { ReportPreviewDialog } from "@/features/assurance/reports/components/ReportPreviewDialog";
import { useReportsPage } from "@/features/assurance/reports/hooks/use-reports-page";

export function ReportsPage() {
  const { companies, selectedCompanyId } = useSelectedCompany();
  const selectedCompany = React.useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );
  const page = useReportsPage(selectedCompanyId);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Utility Master Report"
        description="Single production report for utility master setup and meter reference data."
      >
        <div className="px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{selectedCompany ? selectedCompany.name : "No company selected"}</Badge>
            <span>Preview first, then export the final CSV.</span>
          </div>
        </div>

        {page.defsLoading ? <div className="p-4 text-sm text-muted-foreground">Loading reports from database...</div> : null}
        {!page.defsLoading && !page.utilityMasterReport ? (
          <div className="p-4 text-sm text-muted-foreground">Utility master report is not available.</div>
        ) : null}

        {!page.defsLoading && page.utilityMasterReport ? (
          <div className="px-4 pb-6 pt-3 sm:px-6">
            <div className="grid gap-4 md:max-w-[540px]">
              <ReportGridCard
                def={page.utilityMasterReport}
                previewLoading={page.previewLoading}
                activeKey={page.activeDef?.key}
                onPreview={page.openPreview}
              />
            </div>
          </div>
        ) : null}
      </SectionCard>

      <ReportPreviewDialog
        open={page.previewOpen}
        activeDef={page.activeDef}
        selectedCompanyName={selectedCompany?.name}
        previewLoading={page.previewLoading}
        exporting={page.exporting}
        previewSearch={page.previewSearch}
        previewRows={page.previewRows}
        varValues={page.varValues}
        onOpenChange={page.setPreviewOpen}
        onPreviewSearchChange={page.setPreviewSearch}
        onVarValueChange={(name, value) => page.setVarValues((prev) => ({ ...prev, [name]: value }))}
        onRefresh={() => page.activeDef && void page.loadPreview(page.activeDef)}
        onExport={() => page.activeDef && void page.exportActiveReport(page.activeDef)}
        onCloseReset={page.resetPreviewState}
      />
    </div>
  );
}
