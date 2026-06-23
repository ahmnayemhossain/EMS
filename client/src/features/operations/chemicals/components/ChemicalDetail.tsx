import * as React from "react";
import type { Chemical } from "@/core/types/models/ems";

import { ChemicalSummaryCards } from "@/features/operations/chemicals/components/ChemicalDetailCards";
import { ChemicalDetailTabs } from "@/features/operations/chemicals/components/ChemicalDetailTabs";

export function ChemicalDetail({
  chemical,
  sdsFileName,
  onUnlinkSds,
  unlinking,
}: {
  chemical: Chemical;
  sdsFileName?: string;
  onUnlinkSds?: () => void;
  unlinking?: boolean;
}) {
  return (
    <div className="space-y-4">
      <ChemicalSummaryCards chemical={chemical} sdsFileName={sdsFileName} onUnlinkSds={onUnlinkSds} unlinking={unlinking} />
      <ChemicalDetailTabs chemical={chemical} />
    </div>
  );
}
