import * as React from "react";
import { ClipboardList } from "lucide-react";
import { useDrop } from "react-dnd";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { CAPA } from "@/core/types/models/ems";

import type { CapaBoardColumn } from "../config/board";
import { CapaCard, type CapaDragItem } from "./CapaCard";

const DND_TYPE = "CAPA_CARD";

export function CapaColumn(props: {
  column: CapaBoardColumn;
  items: CAPA[];
  canMove: boolean;
  onMove: (id: string, status: CAPA["status"], targetIndex: number) => void;
  onOpen: (item: CAPA) => void;
  onDismiss?: (item: CAPA) => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [{ isOver }, drop] = useDrop<CapaDragItem, void, { isOver: boolean }>(
    () => ({
      accept: DND_TYPE,
      canDrop: () => props.canMove,
      drop: (dragItem, monitor) => {
        if (monitor.didDrop()) return;
        if (!props.canMove) return;
        props.onMove(dragItem.id, props.column.id, props.items.length);
      },
      collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
    }),
    [props.canMove, props.column.id, props.items.length, props.onMove],
  );

  drop(ref);

  return (
    <div
      ref={ref}
      className={[
        "flex h-full min-w-0 flex-col rounded-[18px] border bg-gradient-to-b p-2 shadow-[0_14px_30px_rgba(15,23,42,0.05)]",
        props.column.accentClassName,
        isOver ? "border-primary/40 ring-2 ring-primary/15" : "border-border/70",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-background/80 px-2.5 py-2 backdrop-blur">
        <div className="text-[13px] font-semibold">{props.column.title}</div>
        <div
          className={[
            "inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-[11px] font-semibold text-white shadow-sm",
            props.column.tone === "critical"
              ? "bg-rose-600"
              : props.column.tone === "warning"
                ? "bg-amber-600"
                : props.column.tone === "info"
                  ? "bg-sky-600"
                  : props.column.tone === "compliant"
                    ? "bg-emerald-600"
                    : "bg-slate-700",
          ].join(" ")}
        >
          {props.items.length}
        </div>
      </div>
      <div className="mt-2 flex-1 space-y-2">
        {props.items.map((item, index) => (
          <CapaCard key={item.id} item={item} index={index} canMove={props.canMove} onMove={props.onMove} onOpen={props.onOpen} onDismiss={props.onDismiss} />
        ))}
        {!props.items.length ? (
          <div className="grid min-h-24 place-items-center rounded-2xl border border-dashed bg-background/55 p-4 text-center text-xs text-muted-foreground">
            <div>
              <ClipboardList className="mx-auto mb-2 size-5" />
              No CAPA
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
