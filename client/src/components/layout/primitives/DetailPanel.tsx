import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/components/ui/primitives/utils";

class PanelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Keep a console breadcrumb so debugging is easier than "overlay only".
    console.error("[DetailPanel] render error:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="text-sm font-semibold">Panel failed to render</div>
        <div className="text-muted-foreground mt-1 text-xs">
          Check the browser console for the stack trace.
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => this.setState({ error: null })}
        >
          Retry
        </Button>
      </div>
    );
  }
}

export function DetailPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  overlay,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-black/50"
        />
        <DialogPrimitive.Content
          className={cn(
            "bg-card text-foreground fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-none flex-col border-l shadow-2xl outline-none sm:w-[min(540px,92vw)] lg:w-[580px]",
          )}
        >
          <div className="relative shrink-0 border-b p-4 pr-12">
            <DialogPrimitive.Title className="text-base font-semibold leading-none">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-muted-foreground mt-1 text-sm">
                {description}
              </DialogPrimitive.Description>
            ) : null}
            <DialogPrimitive.Close className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4">
            <PanelErrorBoundary>{children}</PanelErrorBoundary>
          </div>

          {overlay}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

