import * as React from "react";

import { useReportBoxStore } from "@/core/app/state/report-box/store";

export function ReportBoxInboxSync() {
  const refreshFromInbox = useReportBoxStore((s) => s.refreshFromInbox);

  React.useEffect(() => {
    void refreshFromInbox();
  }, [refreshFromInbox]);

  return null;
}

