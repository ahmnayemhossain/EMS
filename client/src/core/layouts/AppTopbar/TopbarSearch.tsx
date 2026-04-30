import * as React from "react";
import { Command, Search } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { Input } from "@/core/app/components/ui/input";
import { GlobalSearchDialog } from "@/core/layouts/AppTopbar/GlobalSearchDialog";
import { useGlobalSearch } from "@/core/layouts/AppTopbar/use-global-search";

export function TopbarSearch() {
  const search = useGlobalSearch();

  return (
    <>
      <GlobalSearchDialog open={search.open} setOpen={search.setOpen} items={search.items} run={search.run} />
      <div className="relative hidden max-w-[520px] flex-1 md:block">
        <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
        <button
          type="button"
          onClick={() => search.setOpen(true)}
          className="bg-card/70 border-border/80 text-muted-foreground flex h-10 w-full items-center justify-between rounded-md border px-3 pl-9 text-sm shadow-none transition-colors hover:bg-card"
        >
          <span>Search companies, audits, chemicals...</span>
          <span className="text-[11px] font-medium">Ctrl K</span>
        </button>
      </div>

      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          onClick={() => search.setOpen(true)}
        >
          <Command className="size-4" />
        </Button>
      </div>
    </>
  );
}
