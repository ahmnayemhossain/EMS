import { cn } from "@/app/components/ui/utils";

import type { DataColumn } from "@/components/DataTable";

export function MobileDataTable<T>({
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
    <div className={cn("rounded-xl border divide-y", className)}>
      {rows.map((row) => {
        const Wrapper: React.ElementType = onRowClick ? "button" : "div";
        return (
          <Wrapper key={rowKey(row)} type={onRowClick ? "button" : undefined} className={cn("w-full text-left", onRowClick ? "hover:bg-muted/30 cursor-pointer" : undefined)} onClick={onRowClick ? () => onRowClick(row) : undefined}>
            <div className="space-y-2 p-3">
              {columns.map((col) => <MobileDataRow key={col.id} row={row} column={col} />)}
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}

function MobileDataRow<T>({ row, column }: { row: T; column: DataColumn<T> }) {
  const hideLabel = column.header === "" || column.header === null || typeof column.header === "undefined";
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">{!hideLabel ? <div className="text-muted-foreground text-[11px] leading-none">{column.header}</div> : null}</div>
      <div className="min-w-0 text-right text-sm"><div className="inline-block max-w-full break-words">{column.cell(row)}</div></div>
    </div>
  );
}
