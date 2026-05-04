import * as React from "react";

import { auditRecords as seedAuditRecords } from "@/core/data/audit-records";
import { Tabs, TabsContent } from "@/core/app/components/ui/tabs";
import { PageHeader } from "@/core/components/PageHeader";
import type { AuditRecord } from "@/core/types/audit";

import { AuditCreateDialog } from "./components/AuditCreateDialog";
import { AuditModuleTabs, type AuditsModuleTab } from "./components/AuditModuleTabs";
import { AuditsOverviewTab } from "./components/AuditsOverviewTab";
import { CertificationTab } from "./tabs/CertificationTab";
import { LegalLicencesTab } from "./tabs/LegalLicencesTab";
import { TestingTab } from "./tabs/TestingTab";

export function AuditsPage() {
  const [records, setRecords] = React.useState<AuditRecord[]>(() => seedAuditRecords);
  const [moduleTab, setModuleTab] = React.useState<AuditsModuleTab>("audits");
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audits"
        actions={
          <AuditCreateDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onCreate={(record) => setRecords((prev) => [record, ...prev])}
          />
        }
      />

      <Tabs
        value={moduleTab}
        onValueChange={(v) => setModuleTab(v as AuditsModuleTab)}
        className="space-y-6"
      >
        <AuditModuleTabs auditsCount={records.length} />

        <TabsContent value="audits" className="m-0">
          <AuditsOverviewTab records={records} />
        </TabsContent>
        <TabsContent value="certification" className="m-0">
          <CertificationTab />
        </TabsContent>
        <TabsContent value="legal" className="m-0">
          <LegalLicencesTab />
        </TabsContent>
        <TabsContent value="testing" className="m-0">
          <TestingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
