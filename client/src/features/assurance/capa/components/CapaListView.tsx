import * as React from "react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatDate } from "@/core/utils/format";
import type { CAPA } from "@/core/types/models/ems";

import { getSeverityTone, isCapaOverdue, sortCapas } from "../config/board";

export function CapaListView(props: {
  rows: CAPA[];
  onOpen: (item: CAPA) => void;
  mode?: "active" | "dismissed";
  onRestore?: (item: CAPA) => void;
}) {
  const rows = React.useMemo(() => sortCapas(props.rows), [props.rows]);

  return (
    <div className="overflow-hidden rounded-[20px] border bg-card/90 shadow-xs">
      <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_120px_150px_120px_120px] gap-3 border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
        <div>CAPA</div>
        <div>Owner</div>
        <div>Status</div>
        <div>Due date</div>
        <div>Evidence</div>
        <div />
      </div>
      <div className="divide-y">
        {rows.length ? (
          rows.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => props.onOpen(item)}
              className="block w-full text-left transition hover:bg-muted/35"
            >
              <div className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_120px_150px_120px_120px] md:items-center">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{item.title}</div>
                  {item.description ? (
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</div>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">{item.owner}</div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={getSeverityTone(item.severity)}>{item.status.replaceAll("_", " ")}</StatusBadge>
                  {isCapaOverdue(item) ? <StatusBadge tone="critical">overdue</StatusBadge> : null}
                </div>
                <div className="text-sm text-muted-foreground">{formatDate(item.dueDate)}</div>
                <div className="text-sm text-muted-foreground">{item.evidenceCount}</div>
                <div className="flex justify-end">
                  {props.mode === "dismissed" ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onRestore?.(item);
                      }}
                      className="rounded-full border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                    >
                      Restore
                    </button>
                  ) : null}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">No CAPA found.</div>
        )}
      </div>
    </div>
  );
}
