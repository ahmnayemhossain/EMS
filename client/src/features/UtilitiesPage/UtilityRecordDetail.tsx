import { BaselineSection } from "@/features/UtilitiesPage/detail/BaselineSection";
import { BillFilesSection } from "@/features/UtilitiesPage/detail/BillFilesSection";
import { ConsumptionSection } from "@/features/UtilitiesPage/detail/ConsumptionSection";
import { NotesSection } from "@/features/UtilitiesPage/detail/NotesSection";
import { OverviewSection } from "@/features/UtilitiesPage/detail/OverviewSection";
import type { UtilityRecord } from "@/core/types/ems";

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
