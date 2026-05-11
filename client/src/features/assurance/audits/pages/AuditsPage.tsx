import * as React from "react";

import { auditRecords as seedAuditRecords } from "@/core/data/catalog/audit-records";
import { Tabs, TabsContent } from "@/components/ui/primitives/tabs";
import { PageHeader } from "@/components/layout/primitives/PageHeader";
import type { AuditRecord } from "@/core/types/models/audit";

import { AuditCreateDialog } from "../components/core/AuditCreateDialog";
import { AuditModuleTabs, type AuditsModuleTab } from "../components/core/AuditModuleTabs";
import { AuditsOverviewTab } from "../components/core/AuditsOverviewTab";
import { CertificationTab } from "../tabs/CertificationTab";
import { LegalLicencesTab } from "../tabs/LegalLicencesTab";
import { TestingTab } from "../tabs/TestingTab";

export function AuditsPage() {
  const [records, setRecords] = React.useState<AuditRecord[]>(() => seedAuditRecords);
  const [moduleTab, setModuleTab] = React.useState<AuditsModuleTab>("audits");
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
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

