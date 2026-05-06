import * as React from "react";

import { Card, CardContent } from "@/core/app/components/ui/card";
import { DataTable } from "@/core/components/DataTable";
import type { Facility } from "@/core/types/ems";

import { getFacilityColumns } from "../columns";

export function CompanyPerformanceCard({ facilities }: { facilities: Facility[] }) {
  const columns = React.useMemo(() => getFacilityColumns(), []);

  return (
    <Card className="shadow-xs min-w-0">
      <CardContent className="pt-6">
        <div className="text-sm font-semibold">Company performance</div>
        <div className="mt-4">
        <DataTable rows={facilities} columns={columns} rowKey={(r) => r.id} />
        </div>
      </CardContent>
    </Card>
  );
}
