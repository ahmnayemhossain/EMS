import { Download, Trash2 } from "lucide-react";

import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { Button } from "@/components/ui/primitives/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { Document } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

import { DocumentStatusBadge } from "@/features/assurance/documents/config/columns";

type DocumentDetailPanelProps = {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (document: Document) => Promise<void>;
};

export function DocumentDetailPanel(props: DocumentDetailPanelProps) {
  const selected = props.document;

  return (
    <DetailPanel
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={selected?.title || "Document"}
      description={selected ? `${selected.companyName || selected.facilityId} • ${selected.category}` : undefined}
    >
      {selected ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <DocumentStatusBadge status={selected.status} />
            <StatusBadge tone="neutral">{selected.ownerDepartment}</StatusBadge>
            {selected.expiresOn ? <StatusBadge tone="neutral">Expires {formatDate(selected.expiresOn)}</StatusBadge> : null}
          </div>

          <div className="rounded-xl border p-3 text-sm">
            <div><span className="font-medium">File:</span> {selected.fileName}</div>
            {selected.uploadedBy ? <div className="mt-1 text-muted-foreground">Uploaded by {selected.uploadedBy}</div> : null}
            {selected.uploadedAt ? <div className="mt-1 text-muted-foreground">{formatDate(selected.uploadedAt)}</div> : null}
          </div>

          {selected.notes ? (
            <div className="rounded-xl border p-3 text-sm text-muted-foreground">{selected.notes}</div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {selected.fileUrl ? (
              <Button asChild>
                <a href={selected.fileUrl} target="_blank" rel="noreferrer">
                  <Download className="mr-2 size-4" />
                  Open file
                </a>
              </Button>
            ) : null}
            <Button variant="destructive" onClick={() => void props.onDelete(selected)}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </DetailPanel>
  );
}
