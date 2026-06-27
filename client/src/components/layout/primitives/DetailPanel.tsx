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
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
        />
        <DialogPrimitive.Content
          className={cn(
            "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.97))] text-foreground fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-none flex-col border-l border-border/70 shadow-[0_28px_80px_rgba(15,23,42,0.24)] outline-none dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.96))] sm:w-[min(580px,92vw)] lg:w-[660px]",
          )}
        >
          <div className="relative shrink-0 border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.62))] px-5 py-5 pr-14 backdrop-blur dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(15,23,42,0.58))]">
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-[-0.01em]">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-muted-foreground mt-1.5 text-sm leading-6">
                {description}
              </DialogPrimitive.Description>
            ) : null}
            <DialogPrimitive.Close className="ring-offset-background focus:ring-ring absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-transparent px-5 pb-5 pt-5">
            <PanelErrorBoundary>{children}</PanelErrorBoundary>
          </div>

          {overlay}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

