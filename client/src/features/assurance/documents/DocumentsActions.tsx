import { Upload } from "lucide-react";

import { FloatingCreateButton } from "@/components/layout/primitives/FloatingCreateButton";

export function DocumentsActions() {
  return <FloatingCreateButton label="Upload document" icon={<Upload className="size-6 drop-shadow-sm" strokeWidth={2.75} />} />;
}

