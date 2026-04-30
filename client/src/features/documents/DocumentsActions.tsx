import { FileText } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";

export function DocumentsActions() {
  return <Button variant="outline"><FileText className="mr-2 size-4" />Upload document</Button>;
}
