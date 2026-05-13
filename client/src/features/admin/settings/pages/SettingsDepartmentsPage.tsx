import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { ReferenceSettingsModule } from "../modules/root/ReferenceSettingsModule";

export function SettingsDepartmentsPage() {
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
        kind="departments"
        title="Departments"
        noun="Department"
        description="Standardize departments used by employees and users."
      />
    </div>
  );
}


