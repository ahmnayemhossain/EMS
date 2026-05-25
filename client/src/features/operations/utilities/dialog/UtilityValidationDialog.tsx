import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/primitives/dialog";

export function UtilityValidationDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-[min(92vw,460px)] gap-4 rounded-2xl border border-amber-500/20 bg-background/95 p-5 text-center shadow-2xl backdrop-blur sm:p-6">
        <DialogHeader className="items-center text-center">
          <div className="mb-1 flex size-12 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">
            <TriangleAlert className="size-5" />
          </div>
          <DialogTitle className="text-balance text-lg font-semibold">{props.title}</DialogTitle>
          <div className="text-muted-foreground max-w-[34rem] text-balance text-sm leading-6">
            {props.description}
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            className="min-w-24 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400"
            onClick={() => props.onOpenChange(false)}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
