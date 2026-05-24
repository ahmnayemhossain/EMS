import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { StatusStoreModule } from "@/features/admin/settings/modules/screens/StatusStoreModule";

export function SettingsStatusStorePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/settings/approvals")}>
          <ArrowLeft className="mr-2 size-4" />
          Approvals
        </Button>
      </div>
      <StatusStoreModule />
    </div>
  );
}
