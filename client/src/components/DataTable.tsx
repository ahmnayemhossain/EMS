import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { cn } from "@/app/components/ui/utils";

export type DataColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  className,
}: {
  rows: T[];
  columns: Array<DataColumn<T>>;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("rounded-xl border divide-y", className)}>
        {rows.map((row) => {
          const key = rowKey(row);
          const Wrapper: React.ElementType = onRowClick ? "button" : "div";

          return (
            <Wrapper
              key={key}
              type={onRowClick ? "button" : undefined}
              className={cn(
                "w-full text-left",
                onRowClick ? "hover:bg-muted/30 cursor-pointer" : undefined,
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              <div className="space-y-2 p-3">
                {columns.map((col) => {
                  const header = col.header;
                  const hideLabel =
                    header === "" ||
                    header === null ||
                    typeof header === "undefined";

                  return (
                    <div key={col.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {!hideLabel ? (
                          <div className="text-muted-foreground text-[11px] leading-none">
                            {header}
                          </div>
                        ) : null}
                      </div>
                      <div className="min-w-0 text-right text-sm">
                        <div className="inline-block max-w-full break-words">
                          {col.cell(row)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Wrapper>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <TableCell key={col.id} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
