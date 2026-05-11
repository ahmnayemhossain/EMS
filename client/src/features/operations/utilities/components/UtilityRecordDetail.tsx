import { BaselineSection } from "@/features/operations/utilities/detail/BaselineSection";
import { BillFilesSection } from "@/features/operations/utilities/detail/BillFilesSection";
import { ConsumptionSection } from "@/features/operations/utilities/detail/ConsumptionSection";
import { NotesSection } from "@/features/operations/utilities/detail/NotesSection";
import { OverviewSection } from "@/features/operations/utilities/detail/OverviewSection";
import type { UtilityRecord } from "@/core/types/models/ems";

export function UtilityRecordDetail({ record, companyName }: { record: UtilityRecord; companyName: string }) {
  return (
    <div className="space-y-4">
      <OverviewSection record={record} companyName={companyName} />
      <ConsumptionSection record={record} />
      <BaselineSection record={record} />
      <NotesSection record={record} />
      <BillFilesSection record={record} />
    </div>
  );
}
