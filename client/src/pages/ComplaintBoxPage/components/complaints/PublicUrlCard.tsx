import { Copy, ExternalLink } from "lucide-react";

import { Button } from "@/app/components/ui/button";

export function PublicUrlCard({ publicUrl }: { publicUrl: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{publicUrl || "--"}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Scan / open → submit complaint (text / voice / photo). Company is taken from header selection.
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(publicUrl);
              } catch {
                // ignore
              }
            }}
            disabled={!publicUrl}
          >
            <Copy className="mr-2 size-4" />
            Copy
          </Button>
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}
            disabled={!publicUrl}
          >
            <ExternalLink className="mr-2 size-4" />
            Open
          </Button>
        </div>
      </div>
    </div>
  );
}

