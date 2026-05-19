import * as React from "react";
import { CalendarClock, GripVertical, Paperclip } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatDate } from "@/core/utils/format";
import type { CAPA } from "@/core/types/models/ems";

import { getSeverityTone, isCapaOverdue } from "../config/board";

const DND_TYPE = "CAPA_CARD";

export type CapaDragItem = {
  id: string;
  status: CAPA["status"];
  index: number;
};

export function CapaCard(props: {
  item: CAPA;
  index: number;
  canMove: boolean;
  onMove: (id: string, status: CAPA["status"], targetIndex: number) => void;
  onOpen: (item: CAPA) => void;
  onDismiss?: (item: CAPA) => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const dragHandleRef = React.useRef<HTMLDivElement | null>(null);

  const [, drop] = useDrop<CapaDragItem>(
    () => ({
      accept: DND_TYPE,
      canDrop: (dragItem) => props.canMove && (dragItem.id !== props.item.id || dragItem.status !== props.item.status || dragItem.index !== props.index),
      drop: (dragItem, monitor) => {
        if (monitor.didDrop()) return;
        if (!props.canMove) return;
        if (dragItem.id === props.item.id && dragItem.status === props.item.status && dragItem.index === props.index) return;
        props.onMove(dragItem.id, props.item.status, props.index);
      },
    }),
    [props.canMove, props.index, props.item.id, props.item.status, props.onMove],
  );

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: DND_TYPE,
      canDrag: props.canMove,
      item: { id: props.item.id, status: props.item.status, index: props.index },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [props.canMove, props.index, props.item.id, props.item.status],
  );

  preview(drop(ref));
  drag(dragHandleRef);
  const owners = splitOwners(props.item.owner);

  return (
    <div
      ref={ref}
      onClick={() => props.onOpen(props.item)}
      className={[
        "group relative rounded-[16px] border bg-card/90 p-3 pt-5 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_44px_rgba(15,23,42,0.12)]",
        props.canMove ? "cursor-pointer" : "",
        isDragging ? "opacity-55" : "",
        isCapaOverdue(props.item) ? "border-rose-500/35" : "border-border",
      ].join(" ")}
    >
      <div
        ref={dragHandleRef}
        onClick={(event) => event.stopPropagation()}
        className={[
          "absolute left-1/2 top-1.5 -translate-x-1/2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
          props.canMove ? "cursor-grab active:cursor-grabbing" : "cursor-default opacity-0",
        ].join(" ")}
      >
        <GripVertical className="size-3.5 rotate-90" />
      </div>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">{props.item.title}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{owners.map((item) => item.label).join(", ")}</div>
            </div>
            <StatusBadge tone={getSeverityTone(props.item.severity)}>{props.item.severity}</StatusBadge>
          </div>
          {props.item.description ? (
            <div className="mt-2 line-clamp-3 text-[12px] leading-5 text-muted-foreground">{props.item.description}</div>
          ) : null}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] text-muted-foreground">
              <CalendarClock className="size-3" />
              {formatDate(props.item.dueDate)}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] text-muted-foreground">
              <Paperclip className="size-3" />
              {props.item.evidenceCount}
            </div>
            {isCapaOverdue(props.item) ? <StatusBadge tone="critical">overdue</StatusBadge> : null}
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-3">
            <div className="flex -space-x-2">
              {owners.slice(0, 3).map((owner, index) => (
                <div
                  key={`${owner.label}-${index}`}
                  className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-semibold text-foreground shadow-sm"
                  title={owner.label}
                >
                  {owner.initials}
                </div>
              ))}
              {owners.length > 3 ? (
                <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-semibold text-muted-foreground shadow-sm">
                  +{owners.length - 3}
                </div>
              ) : null}
            </div>
            {props.item.status === "closed" && !props.item.dismissed ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  props.onDismiss?.(props.item);
                }}
                className="rounded-full border px-2 py-1 text-[10px] font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                Dismiss
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function splitOwners(value: string) {
  return value
    .split(/,|\/|&|\band\b/gi)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      initials: label
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(""),
    }));
}
