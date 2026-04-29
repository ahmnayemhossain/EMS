import { UtilitiesComparisonCard } from "@/pages/UtilitiesPage/UtilitiesComparisonCard";
import { UtilitiesTrendCard } from "@/pages/UtilitiesPage/UtilitiesTrendCard";
import type { UtilityRecord } from "@/types/ems";

export function UtilityAnalyticsSection({
  isMobile,
  rows,
  trendData,
  getCompanyName,
}: {
  isMobile: boolean;
  rows: UtilityRecord[];
  trendData: Array<{ label: string; value: number }>;
  getCompanyName: (id: string) => string;
}) {
  if (isMobile) {
    return (
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-4 pb-1">
          <UtilitiesTrendCard data={trendData} className="w-[92vw] max-w-[720px] shrink-0" />
          <UtilitiesComparisonCard rows={rows} getCompanyName={getCompanyName} className="w-[92vw] max-w-[520px] shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <UtilitiesTrendCard data={trendData} />
      </div>
      <UtilitiesComparisonCard rows={rows} getCompanyName={getCompanyName} />
    </div>
  );
}
