import * as React from "react";

import { Input } from "@/components/ui/primitives/input";
import { Button } from "@/components/ui/primitives/button";
import { Textarea } from "@/components/ui/primitives/textarea";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { SelectFilter } from "@/components/forms/SelectFilter";

export function WastewaterCreateDialog() {
  return (
    <CreateActionDialog title="Create lab record">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Sample date</div>
          <Input type="date" />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Point</div>
          <SelectFilter
            value={undefined}
            onChange={(value) => {
              void value;
            }}
            placeholder="Select point"
            items={[
              { value: "inlet", label: "Inlet" },
              { value: "outlet", label: "Outlet" },
            ]}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">pH</div>
          <Input type="number" placeholder="0" />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">COD</div>
          <Input type="number" placeholder="0" />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">BOD</div>
          <Input type="number" placeholder="0" />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">TSS</div>
          <Input type="number" placeholder="0" />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Lab report</div>
          <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            Upload lab PDF (placeholder)
          </div>
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Notes</div>
          <Textarea placeholder="Optional notes" />
        </div>
        <div className="flex items-center justify-between rounded-xl border p-3 sm:col-span-2">
          <div className="text-sm font-medium">Exceedance auto-check</div>
          <Button type="button" variant="outline" size="sm">
            Enable
          </Button>
        </div>
      </div>
    </CreateActionDialog>
  );
}


