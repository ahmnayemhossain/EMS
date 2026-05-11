import * as React from "react";

import { Card, CardContent } from "@/components/ui/primitives/card";
import { DataTable } from "@/components/table/DataTable";
import type { Facility } from "@/core/types/models/ems";

import { getFacilityColumns } from "../config/columns";

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

