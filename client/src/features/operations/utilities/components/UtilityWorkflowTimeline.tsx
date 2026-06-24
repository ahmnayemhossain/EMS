import { Check, Circle, X } from "lucide-react";

import type { ApprovalTrailItem } from "@/features/operations/utilities/utils/utility-workflow-trail";
import { formatDate } from "@/core/utils/format";

type UtilityWorkflowTimelineProps = {
  orderedSteps: Array<{ key: string; name: string }>;
  currentStepIndex: number;
  pendingStepIndex: number;
  rejectedSteps: Set<string>;
  approvalTrail: Map<string, ApprovalTrailItem>;
};

export function UtilityWorkflowTimeline(props: UtilityWorkflowTimelineProps) {
  if (!props.orderedSteps.length) {
    return null;
  }

  return (
    <div className="mt-5 rounded-[20px] border border-border/55 bg-muted/20 px-4 py-4">
      <div className="space-y-3">
        {props.orderedSteps.map((step, index) => {
          const visual = getTimelineVisual(
            index,
            props.currentStepIndex,
            props.pendingStepIndex,
            props.rejectedSteps.has(step.key),
          );
          const Icon = visual.icon;
          const isLast = index === props.orderedSteps.length - 1;
          const trailItem = props.approvalTrail.get(step.key);

          return (
            <div key={step.key} className="grid grid-cols-[1.9rem_minmax(0,1fr)] gap-3.5">
              <div className="flex flex-col items-center">
                <span className={visual.iconClass}>
                  {Icon === X ? (
                    <X className="size-4 stroke-[3] text-rose-600 dark:text-rose-300" />
                  ) : (
                    <Icon className="size-3.5" />
                  )}
                </span>
                {!isLast ? <span className={visual.lineClass} /> : null}
              </div>
              <div className={visual.itemClass}>
                <div className="min-w-0">
                  <div className={visual.labelClass}>{step.name}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-4">
                    {trailItem?.actedBy ? (
                      <>
                        <TrailAvatar actedBy={trailItem.actedBy} />
                        <span className="font-medium text-foreground/85 dark:text-foreground/80">
                          {trailItem.actedBy}
                        </span>
                        {trailItem.actedAt ? (
                          <span className="rounded-full border border-border/55 bg-background/75 px-2 py-0.5 text-[10px] text-muted-foreground">
                            {formatDate(trailItem.actedAt)}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-muted-foreground">No activity yet</span>
                    )}
                  </div>
                  {trailItem?.note ? (
                    <div className="mt-2 rounded-xl border border-border/55 bg-background/75 px-3 py-2 text-xs leading-5 text-muted-foreground">
                      <span className="font-medium text-foreground/85 dark:text-foreground/80">
                        Note:
                      </span>{" "}
                      {trailItem.note}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrailAvatar(props: { actedBy: string }) {
  const initials = props.actedBy
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");

  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/18 bg-[linear-gradient(180deg,rgba(16,185,129,0.16),rgba(16,185,129,0.07))] text-[9px] font-bold text-emerald-700 shadow-sm dark:text-emerald-300">
      {initials || "?"}
    </span>
  );
}

function getTimelineVisual(
  index: number,
  currentIndex: number,
  pendingIndex: number,
  wasRejected: boolean,
) {
  const hasPreview = pendingIndex >= 0;
  const isPreviewingReverse = hasPreview && currentIndex >= 0 && pendingIndex < currentIndex;
  const isPreviewingForward = hasPreview && currentIndex >= 0 && pendingIndex > currentIndex;
  const isCanceled =
    (isPreviewingReverse && index > pendingIndex && index <= currentIndex) ||
    (!hasPreview && wasRejected && index > currentIndex);
  const isSelectedTarget = hasPreview && index === pendingIndex;
  const isCompleted =
    !isCanceled &&
    currentIndex >= 0 &&
    ((!hasPreview && index <= currentIndex) ||
      (isPreviewingForward && index <= currentIndex) ||
      (isPreviewingReverse && index < pendingIndex));
  const isNextAction = !hasPreview && currentIndex >= 0 && index === currentIndex + 1;

  if (isCanceled) {
    return {
      icon: X,
      iconClass:
        "flex size-7 items-center justify-center rounded-full border border-rose-400/28 bg-[linear-gradient(180deg,rgba(251,113,133,0.22),rgba(251,113,133,0.08))] text-rose-700 shadow-[0_8px_18px_rgba(244,63,94,0.14)] dark:border-rose-400/20 dark:text-rose-300",
      labelClass: "text-sm font-bold tracking-[0.01em] text-rose-700 dark:text-rose-300",
      itemClass:
        "rounded-2xl border border-rose-400/18 bg-[linear-gradient(180deg,rgba(251,113,133,0.10),rgba(255,255,255,0.03))] px-3.5 py-2.5 shadow-[0_10px_24px_rgba(244,63,94,0.08)]",
      lineClass: "mt-2.5 min-h-8 w-px flex-1 bg-rose-300/55",
    };
  }

  if (isSelectedTarget || isNextAction) {
    return {
      icon: Circle,
      iconClass:
        "flex size-7 animate-pulse items-center justify-center rounded-full bg-sky-500/12 text-sky-700 ring-2 ring-sky-300/40 shadow-[0_0_0_6px_rgba(56,189,248,0.07)] dark:text-sky-300",
      labelClass: "text-sm font-bold tracking-[0.01em] text-sky-700 dark:text-sky-300",
      itemClass:
        "rounded-2xl border border-sky-500/18 bg-[linear-gradient(180deg,rgba(14,165,233,0.10),rgba(255,255,255,0.03))] px-3.5 py-2.5 shadow-[0_10px_22px_rgba(14,165,233,0.08)]",
      lineClass: "mt-2.5 min-h-8 w-px flex-1 bg-sky-300/55",
    };
  }

  if (isCompleted) {
    return {
      icon: Check,
      iconClass:
        "flex size-7 items-center justify-center rounded-full border border-emerald-400/28 bg-[linear-gradient(180deg,rgba(16,185,129,0.20),rgba(16,185,129,0.08))] text-emerald-700 shadow-[0_8px_18px_rgba(16,185,129,0.12)] dark:border-emerald-400/20 dark:text-emerald-300",
      labelClass: "text-sm font-bold tracking-[0.01em] text-emerald-950 dark:text-emerald-100",
      itemClass:
        "rounded-2xl border border-emerald-400/18 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.03))] px-3.5 py-2.5 shadow-[0_10px_24px_rgba(16,185,129,0.08)]",
      lineClass: "mt-2.5 min-h-8 w-px flex-1 bg-emerald-300/55",
    };
  }

  return {
    icon: Circle,
    iconClass:
      "flex size-7 items-center justify-center rounded-full border border-border/60 bg-muted/55 text-muted-foreground",
    labelClass: "text-sm font-semibold tracking-[0.01em] text-muted-foreground",
    itemClass:
      "rounded-2xl border border-border/60 bg-background/78 px-3.5 py-2.5 shadow-sm",
    lineClass: "mt-2.5 min-h-8 w-px flex-1 bg-border/80",
  };
}
