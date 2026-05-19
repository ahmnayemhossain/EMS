import * as React from "react";
import { Link } from "react-router";
import { Truck } from "lucide-react";

import type { Facility } from "@/core/types/models/ems";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Textarea } from "@/components/ui/primitives/textarea";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { SelectFilter } from "@/components/forms/SelectFilter";

export function WasteCreateDialog({
  facilities,
  facilityId,
  onFacilityIdChange,
  floating,
}: {
  facilities: Facility[];
  facilityId?: string;
  onFacilityIdChange: (id: string | undefined) => void;
  floating?: boolean;
}) {
  return (
    <CreateActionDialog title="Create waste log" triggerLabel="Create waste log" triggerVariant={floating ? "floating" : "default"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Company</div>
          <SelectFilter
            value={facilityId}
            onChange={onFacilityIdChange}
            placeholder="Select company"
            items={facilities.map((f) => ({ value: f.id, label: f.name }))}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Date</div>
          <Input type="date" />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Waste stream</div>
          <Input placeholder="e.g. ETP Sludge / Used solvent" />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Type</div>
          <SelectFilter
            value={undefined}
            onChange={(value) => {
              void value;
            }}
            placeholder="Select type"
            items={[
              { value: "hazardous", label: "Hazardous" },
              { value: "non_hazardous", label: "Non-hazardous" },
              { value: "recyclable", label: "Recyclable" },
              { value: "sludge", label: "Sludge" },
              { value: "e_waste", label: "E-waste" },
            ]}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="text-muted-foreground text-xs">Qty (kg)</div>
          <Input type="number" placeholder="0" />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Storage location</div>
          <Input placeholder="e.g. Haz waste store / Sludge yard" />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="text-muted-foreground text-xs">Notes</div>
          <Textarea placeholder="Optional notes" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
          <div className="text-sm font-medium">Reports</div>
          <Button asChild type="button" variant="outline" size="sm">
            <Link to="/reports">
              <Truck className="mr-2 size-4" />
              Disposal reports
            </Link>
          </Button>
        </div>
      </div>
    </CreateActionDialog>
  );
}
