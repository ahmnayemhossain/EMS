import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/app/components/ui/button";
import { ReferenceSettingsModule } from "@/pages/settings/modules/ReferenceSettingsModule";

export function SettingsUomPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
          <ArrowLeft className="mr-2 size-4" />
          Settings
        </Button>
      </div>
      <ReferenceSettingsModule
        kind="uom"
        title="Units (UOM)"
        noun="UOM"
        description="Units used across utilities, waste, chemicals, and operational records."
      />
    </div>
  );
}

