import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { ReferenceSettingsModule } from "../modules/screens/ReferenceSettingsModule";

export function SettingsSuppliersPage() {
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
        kind="suppliers"
        title="Suppliers"
        noun="Supplier"
        description="Suppliers and service providers used by operation modules."
      />
    </div>
  );
}



