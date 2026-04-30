import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/core/app/components/ui/sheet";
import { SIDEBAR_WIDTH_MOBILE } from "@/core/app/components/ui/sidebar/sidebar.constants";

export function SidebarMobile({
  openMobile,
  setOpenMobile,
  side,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  side: "left" | "right";
}) {
  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
      <SheetContent data-sidebar="sidebar" data-slot="sidebar" data-mobile="true" className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 pb-[env(safe-area-inset-bottom)] [&>button]:hidden" style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties} side={side}>
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Displays the mobile sidebar.</SheetDescription>
        </SheetHeader>
        <div className="flex h-full w-full flex-col">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
