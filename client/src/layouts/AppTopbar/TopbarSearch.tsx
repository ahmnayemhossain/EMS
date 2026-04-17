import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";

export function TopbarSearch() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="relative hidden max-w-[520px] flex-1 md:block">
        <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
        <Input className="pl-9" placeholder="Search factories, audits, chemicals..." />
      </div>

      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          onClick={() => setOpen(true)}
        >
          <Search className="size-4" />
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="top" className="p-0 pt-[env(safe-area-inset-top)]">
            <SheetHeader className="px-4 pt-4">
              <SheetTitle>Search</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4 pt-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
                <Input autoFocus className="pl-9" placeholder="Search..." />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
