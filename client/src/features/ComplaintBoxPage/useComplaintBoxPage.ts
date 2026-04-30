import * as React from "react";

import type { ComplaintBoxAction } from "@/features/ComplaintBoxPage/complaint-box.types";
import type { ReportBoxReport } from "@/core/types/ems";

export function useComplaintBoxPage() {
  const [tab, setTab] = React.useState<"complaints" | "complaint-trend" | "records">("complaints");
  const [showFlaggedOnly, setShowFlaggedOnly] = React.useState(false);
  const [selectedComplaint, setSelectedComplaint] = React.useState<ReportBoxReport | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [refreshingInbox, setRefreshingInbox] = React.useState(false);
  const [action, setAction] = React.useState<ComplaintBoxAction>(null);

  return {
    tab,
    setTab,
    showFlaggedOnly,
    setShowFlaggedOnly,
    selectedComplaint,
    setSelectedComplaint,
    drawerOpen,
    setDrawerOpen,
    refreshingInbox,
    setRefreshingInbox,
    action,
    setAction,
  };
}
