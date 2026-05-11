import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";

export function FacilityNotFoundCard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Company not found</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Unknown company id.
      </CardContent>
    </Card>
  );
}


