import * as React from "react";
import type { Chemical } from "@/core/types/ems";

import { ChemicalSummaryCards } from "@/features/ChemicalsPage/components/ChemicalDetailCards";
import { ChemicalDetailTabs } from "@/features/ChemicalsPage/components/ChemicalDetailTabs";

export function ChemicalDetail({
  chemical,
  sdsFileName,
}: {
  chemical: Chemical;
  sdsFileName?: string;
}) {
  return (
    <div className="space-y-4">
      <ChemicalSummaryCards chemical={chemical} sdsFileName={sdsFileName} />
      <ChemicalDetailTabs chemical={chemical} />
    </div>
  );
}
