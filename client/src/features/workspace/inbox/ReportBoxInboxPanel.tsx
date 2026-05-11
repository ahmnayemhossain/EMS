import { PageHeader } from "@/components/layout/primitives/PageHeader";
import { ComplaintBoxPage } from "@/features/people/complaint-box/pages";

export function ReportBoxInboxPanel() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <ComplaintBoxPage />
    </div>
  );
}


