import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";

export function WastewaterSludgeCard() {
  return (
    <Card className="shadow-xs min-w-0">
      <CardHeader>
        <CardTitle>Sludge generation</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl border p-4">
          <div className="text-muted-foreground text-xs">This month (mock)</div>
          <div className="mt-1 text-xl font-semibold">8,200 kg</div>
          <div className="text-muted-foreground mt-2 text-sm">
            Link to disposal logs in Waste module.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


