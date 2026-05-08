import { PageHeader } from "@/core/components/PageHeader";
import { ComplaintBoxPage } from "@/features/ComplaintBoxPage";

export function ReportBoxInboxPanel() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <ComplaintBoxPage />
    </div>
  );
}

