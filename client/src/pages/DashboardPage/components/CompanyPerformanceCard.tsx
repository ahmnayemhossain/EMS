import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DataTable } from "@/components/DataTable";
import type { Facility } from "@/types/ems";

import { getFacilityColumns } from "../columns";

export function CompanyPerformanceCard({ facilities }: { facilities: Facility[] }) {
  const columns = React.useMemo(() => getFacilityColumns(), []);

  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle>Company performance</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <DataTable rows={facilities} columns={columns} rowKey={(r) => r.id} />
      </CardContent>
    </Card>
  );
}

