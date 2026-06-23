import { ExternalLink, X } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/primitives/accordion";
import { Button } from "@/components/ui/primitives/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/primitives/drawer";
import { Separator } from "@/components/ui/primitives/separator";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { SDSRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

type SdsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected?: SDSRecord;
  onEdit: () => void;
};

export function SdsDrawer(props: SdsDrawerProps) {
  const latestFile = props.selected?.files?.[0];

  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange} direction="right">
      <DrawerContent className="sm:max-w-xl">
        <DrawerHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DrawerTitle className="truncate">{props.selected?.chemicalName ?? "SDS"}</DrawerTitle>
              {props.selected ? (
                <div className="text-muted-foreground mt-1 text-sm">
                  {props.selected.supplier} - Rev {formatDate(props.selected.revisionDate)}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={props.onEdit}>
                Edit
              </Button>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => props.onOpenChange(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </DrawerHeader>
        <Separator />

        <div className="flex-1 overflow-y-auto p-4">
          {props.selected ? (
            <div className="space-y-4">
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground text-xs">File</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="min-w-0 text-sm font-medium">
                    {props.selected.fileName || latestFile?.name || "No PDF uploaded"}
                  </div>
                  {latestFile?.url ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={latestFile.url} target="_blank" rel="noreferrer">
                        Open PDF
                        <ExternalLink className="ml-2 size-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>

              <Accordion type="multiple" defaultValue={["1"]} className="w-full">
                {props.selected.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger>
                      <span className="flex min-w-0 items-center gap-2">
                        <StatusBadge tone="neutral">Section {section.id}</StatusBadge>
                        <span className="truncate">{section.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-muted-foreground text-sm">{section.summary || "-"}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">Select an SDS record.</div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
