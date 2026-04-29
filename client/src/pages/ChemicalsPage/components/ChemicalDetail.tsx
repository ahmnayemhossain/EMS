import * as React from "react";
import type { Chemical } from "@/types/ems";

import { ChemicalSummaryCards } from "@/pages/ChemicalsPage/components/ChemicalDetailCards";
import { ChemicalDetailTabs } from "@/pages/ChemicalsPage/components/ChemicalDetailTabs";

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
