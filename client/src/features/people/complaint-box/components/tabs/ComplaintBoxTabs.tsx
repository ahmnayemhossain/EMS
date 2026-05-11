import { TabsContent } from "@/components/ui/primitives/tabs";
import type { ReportBoxRecord, ReportBoxReport } from "@/core/types/models/ems";

import { ComplaintsTab } from "@/features/people/complaint-box/components/tabs/ComplaintsTab";
import { ComplaintRecordsTab } from "@/features/people/complaint-box/components/tabs/ComplaintRecordsTab";
import { ComplaintTrendTab } from "@/features/people/complaint-box/components/tabs/ComplaintTrendTab";

export function ComplaintBoxTabs({
  reports,
  records,
  publicUrl,
  flaggedCount,
  showFlaggedOnly,
  onOpenComplaint,
  onRequestRemoveRecord,
}: {
  reports: ReportBoxReport[];
  records: ReportBoxRecord[];
  publicUrl: string;
  flaggedCount: number;
  showFlaggedOnly: boolean;
  onOpenComplaint: (report: ReportBoxReport) => void;
  onRequestRemoveRecord: (record: ReportBoxRecord) => void;
}) {
  return (
    <>
      <TabsContent value="complaints">
        <ComplaintsTab reports={reports} publicUrl={publicUrl} showFlaggedOnly={showFlaggedOnly} onOpenComplaint={onOpenComplaint} />
      </TabsContent>
      <TabsContent value="complaint-trend">
        <ComplaintTrendTab reports={reports} flaggedCount={flaggedCount} />
      </TabsContent>
      <TabsContent value="records">
        <ComplaintRecordsTab records={records} onRequestRemoveRecord={onRequestRemoveRecord} />
      </TabsContent>
    </>
  );
}

