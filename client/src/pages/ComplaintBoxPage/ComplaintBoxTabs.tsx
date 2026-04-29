import { TabsContent } from "@/app/components/ui/tabs";
import type { ReportBoxRecord, ReportBoxReport } from "@/types/ems";

import { ComplaintsTab } from "@/pages/ComplaintBoxPage/components/ComplaintsTab";
import { ComplaintRecordsTab } from "@/pages/ComplaintBoxPage/components/ComplaintRecordsTab";
import { ComplaintTrendTab } from "@/pages/ComplaintBoxPage/components/ComplaintTrendTab";

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
