import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { UserWiseStatusModule } from "@/features/admin/settings/modules/screens/UserWiseStatusModule";

export function SettingsUserWiseStatusPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/settings/approvals")}>
          <ArrowLeft className="mr-2 size-4" />
          Approvals
        </Button>
      </div>
      <UserWiseStatusModule />
    </div>
  );
}
