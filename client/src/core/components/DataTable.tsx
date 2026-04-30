import * as React from "react";

import { useIsMobile } from "@/core/app/components/ui/use-mobile";

import { DesktopDataTable } from "@/core/components/data-table.desktop";
import { MobileDataTable } from "@/core/components/data-table.mobile";

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
  if (isMobile) return <MobileDataTable rows={rows} columns={columns} rowKey={rowKey} onRowClick={onRowClick} className={className} />;
  return <DesktopDataTable rows={rows} columns={columns} rowKey={rowKey} onRowClick={onRowClick} className={className} />;
}
