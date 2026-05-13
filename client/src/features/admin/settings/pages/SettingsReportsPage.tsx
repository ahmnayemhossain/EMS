import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { ReportsSettingsModule } from "../modules/screens/ReportsSettingsModule";

export function SettingsReportsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
          <ArrowLeft className="mr-2 size-4" />
          Settings
        </Button>
      </div>
      <ReportsSettingsModule />
    </div>
  );
}



