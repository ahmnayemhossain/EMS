import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import type { AuditRecord } from "@/core/types/models/audit";

export function AuditDetailActions({ audit }: { audit: AuditRecord }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => navigate("/audit-calendar")}>
        Open audit calendar
      </Button>
      {audit.findingsCount.critical + audit.findingsCount.major > 0 ? (
        <Button variant="outline" onClick={() => navigate("/capa")}>
          Open CAPA
        </Button>
      ) : null}
    </div>
  );
}

