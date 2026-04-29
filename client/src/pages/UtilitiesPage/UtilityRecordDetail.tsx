import { BaselineSection } from "@/pages/UtilitiesPage/detail/BaselineSection";
import { BillFilesSection } from "@/pages/UtilitiesPage/detail/BillFilesSection";
import { ConsumptionSection } from "@/pages/UtilitiesPage/detail/ConsumptionSection";
import { NotesSection } from "@/pages/UtilitiesPage/detail/NotesSection";
import { OverviewSection } from "@/pages/UtilitiesPage/detail/OverviewSection";
import type { UtilityRecord } from "@/types/ems";

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
