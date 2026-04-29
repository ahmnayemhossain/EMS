"use client";

import * as React from "react";
import { TableBody, TableFooter, TableHeader, TableRow } from "./table-parts";
import { TableCaption, TableCell, TableHead } from "./table-cells";
import { cn } from "./utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
