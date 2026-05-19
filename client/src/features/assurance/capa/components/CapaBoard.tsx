import * as React from "react";

import type { CAPA } from "@/core/types/models/ems";

import { capaBoardColumns, sortCapas } from "../config/board";
import { CapaColumn } from "./CapaColumn";

export function CapaBoard(props: {
  rows: CAPA[];
  canMove: boolean;
  onMove: (id: string, status: CAPA["status"], targetIndex: number) => void;
  onOpen: (item: CAPA) => void;
  onDismiss?: (item: CAPA) => void;
}) {
  const byStatus = React.useMemo(
    () =>
      new Map(
        capaBoardColumns.map((column) => [
          column.id,
          sortCapas(props.rows.filter((item) => item.status === column.id)),
        ]),
      ),
    [props.rows],
  );

  return (
    <div className="pb-6">
      <div className="grid items-stretch gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {capaBoardColumns.map((column) => (
          <div key={column.id} className="min-w-0">
            <CapaColumn
              column={column}
              items={byStatus.get(column.id) ?? []}
              canMove={props.canMove}
              onMove={props.onMove}
              onOpen={props.onOpen}
              onDismiss={props.onDismiss}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
