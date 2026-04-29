import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { cn } from "@/app/components/ui/utils";

import type { DataColumn } from "@/components/DataTable";

export function DesktopDataTable<T>({
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
  return (
    <div className={cn("rounded-xl border", className)}>
      <Table>
        <TableHeader><TableRow>{columns.map((col) => <TableHead key={col.id} className={col.className}>{col.header}</TableHead>)}</TableRow></TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)} className={onRowClick ? "cursor-pointer" : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined}>
              {columns.map((col) => <TableCell key={col.id} className={col.className}>{col.cell(row)}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
