import { UtilitiesComparisonCard } from "@/features/operations/utilities/components/UtilitiesComparisonCard";
import { UtilitiesTrendCard } from "@/features/operations/utilities/components/UtilitiesTrendCard";

export function UtilityAnalyticsSection({
  isMobile,
  trendData,
  missingMonthLabels,
  monthWarnings,
}: {
  isMobile: boolean;
  trendData: Array<{ label: string; value: number }>;
  missingMonthLabels: string[];
  monthWarnings: Array<{ month: string; detail: string }>;
}) {
  if (isMobile) {
    return (
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-4 pb-1">
          <UtilitiesTrendCard data={trendData} className="w-[92vw] max-w-[720px] shrink-0" />
          <UtilitiesComparisonCard missingMonthLabels={missingMonthLabels} monthWarnings={monthWarnings} className="w-[92vw] max-w-[520px] shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <UtilitiesTrendCard data={trendData} />
      </div>
      <UtilitiesComparisonCard missingMonthLabels={missingMonthLabels} monthWarnings={monthWarnings} />
    </div>
  );
}
