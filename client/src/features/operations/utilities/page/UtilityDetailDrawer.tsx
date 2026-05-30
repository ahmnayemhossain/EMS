import * as React from "react";
import { Check, Circle, Edit, FileDown, Trash2, X } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { Button } from "@/components/ui/primitives/button";
import { Textarea } from "@/components/ui/primitives/textarea";
import { UtilityRecordDetail } from "@/features/operations/utilities/components/UtilityRecordDetail";
import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";
import { formatDate, formatUtilityType } from "@/core/utils/format";
import { getStepName, getWorkflowStatus } from "@/features/operations/utilities/hooks/approval-flow";
import { exportUtilityReport } from "@/features/operations/utilities/page/export-utility-report";
import {
  getOrderedWorkflowSteps,
  getStepIndex,
  getTransitionDirection,
  isWorkflowTransitionBlocked,
  normalizeWorkflowStepKey,
  readWorkflowConfirmDescription,
  readWorkflowConfirmTitle,
  readWorkflowStatusLabel,
  splitTransitionsByDirection,
} from "@/features/operations/utilities/page/workflow-ui";

export function UtilityDetailDrawer(props: {
  selected: UtilityRecord | null;
  companies: Array<{ id: string; name: string }>;
  getCompanyName: (id: string) => string;
  approvalFlow: UtilityApprovalFlow | null;
  canDelete: boolean;
  onSelect: (record: UtilityRecord | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  onTransitionMonth: (transitionKey: string, note?: string) => void | Promise<void>;
}) {
  const [confirmTransitionKey, setConfirmTransitionKey] = React.useState("");
  const [confirmNote, setConfirmNote] = React.useState("");
  const description = props.selected
    ? `${props.companies.find((company) => company.id === props.selected?.facilityId)?.name || "Company"} • ${formatDate(props.selected.periodStart)} to ${formatDate(props.selected.periodEnd)}`
    : undefined;

  React.useEffect(() => {
    if (!props.selected) {
      setConfirmTransitionKey("");
      setConfirmNote("");
    }
  }, [props.selected]);

  const currentStepKey = normalizeWorkflowStepKey(
    props.approvalFlow,
    String(props.approvalFlow?.currentStepKey || props.selected?.approvalStatus || "draft").trim().toLowerCase() || "draft",
  );
  const actionTransitions = React.useMemo(
    () =>
      props.approvalFlow?.currentStepKey
        ? props.approvalFlow.transitions || []
        : (props.approvalFlow?.transitions || []).filter(
            (transition) => normalizeWorkflowStepKey(props.approvalFlow, transition.fromStepKey) === currentStepKey,
          ),
    [props.approvalFlow, currentStepKey],
  );
  const { forward: forwardTransitions, reverse: reverseTransitions } = React.useMemo(
    () => splitTransitionsByDirection(props.approvalFlow, currentStepKey, actionTransitions),
    [props.approvalFlow, currentStepKey, actionTransitions],
  );
  const primaryTransition = forwardTransitions[0] || null;
  const reverseTransition = reverseTransitions[0] || null;
  const selectedTransition = primaryTransition || null;
  const pendingTransition = actionTransitions.find((transition) => transition.key === confirmTransitionKey) || null;
  const previewTransition = pendingTransition || null;
  const workflowStatus = props.selected ? getWorkflowStatus(props.selected, props.approvalFlow) : null;
  const actionBlockReason = readTransitionBlockReason(props.approvalFlow, currentStepKey, selectedTransition, props.selected);
  const orderedSteps = React.useMemo(() => getOrderedWorkflowSteps(props.approvalFlow), [props.approvalFlow]);
  const currentStepIndex = getStepIndex(props.approvalFlow, currentStepKey);
  const pendingStepIndex = previewTransition
    ? getStepIndex(props.approvalFlow, previewTransition.toStepKey)
    : -1;
  const approvalTrail = React.useMemo(
    () => buildApprovalTrail(props.selected, props.approvalFlow, orderedSteps),
    [props.selected, props.approvalFlow, orderedSteps],
  );
  const rejectedSteps = React.useMemo(
    () => buildRejectedSteps(props.selected, props.approvalFlow),
    [props.selected, props.approvalFlow],
  );
  const selectedStatusLabel = pendingTransition
      ? readWorkflowStatusLabel(pendingTransition.toStepKey, props.approvalFlow)
      : selectedTransition
      ? readWorkflowStatusLabel(selectedTransition.toStepKey, props.approvalFlow)
      : "No status";
  const selectedStatusKey = pendingTransition?.toStepKey || selectedTransition?.toStepKey || "";

  React.useEffect(() => {
    if (!actionTransitions.length) {
      setConfirmTransitionKey("");
      return;
    }
    setConfirmTransitionKey((current) =>
      current && actionTransitions.some((transition) => transition.key === current) ? current : "",
    );
  }, [actionTransitions]);

  return (
    <DetailPanel
      open={Boolean(props.selected)}
      onOpenChange={(open) => {
        if (!open) props.onSelect(null);
      }}
      title={props.selected ? `${formatUtilityType(props.selected.type)} — ${props.selected.meterName}` : "Utility record"}
      description={description}
      overlay={
        pendingTransition ? (
          <WorkflowConfirmOverlay
            tone={getTransitionDirection(props.approvalFlow, currentStepKey, pendingTransition) === "reverse" ? "warning" : "default"}
            title={readWorkflowConfirmTitle(getTransitionDirection(props.approvalFlow, currentStepKey, pendingTransition))}
            description={readWorkflowConfirmDescription(props.approvalFlow, currentStepKey, pendingTransition.toStepKey)}
            confirmLabel={getTransitionDirection(props.approvalFlow, currentStepKey, pendingTransition) === "reverse" ? "Reject" : "Save"}
            note={confirmNote}
            onNoteChange={setConfirmNote}
            requireNote={getTransitionDirection(props.approvalFlow, currentStepKey, pendingTransition) === "reverse"}
            onCancel={() => {
              setConfirmTransitionKey("");
              setConfirmNote("");
            }}
            onConfirm={async () => {
              await props.onTransitionMonth(pendingTransition.key, confirmNote);
              setConfirmTransitionKey("");
              setConfirmNote("");
            }}
          />
        ) : null
      }
    >
      {props.selected ? (
        <div className="space-y-4">
          <div className="rounded-[24px] border border-border/60 bg-background/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={workflowStatus?.tone || "neutral"} className="rounded-full">
                    {workflowStatus?.label || getStepName(props.approvalFlow, currentStepKey)}
                  </StatusBadge>
                  <span className="text-sm font-medium">
                    Current: {getStepName(props.approvalFlow, currentStepKey)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className="h-10 rounded-xl px-4" onClick={props.onEdit}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </Button>
                <Button variant="destructive" className="h-10 rounded-xl px-4" onClick={props.onDelete} disabled={!props.canDelete}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>

            {orderedSteps.length ? (
              <div className="mt-5 rounded-[20px] border border-border/55 bg-muted/20 px-4 py-4">
                <div className="space-y-3">
                  {orderedSteps.map((step, index) => {
                    const visual = getTimelineVisual(index, currentStepIndex, pendingStepIndex, rejectedSteps.has(step.key));
                    const Icon = visual.icon;
                    const isLast = index === orderedSteps.length - 1;
                    const trailItem = approvalTrail.get(step.key);
                    return (
                      <div key={step.key} className="grid grid-cols-[1.9rem_minmax(0,1fr)] gap-3.5">
                        <div className="flex flex-col items-center">
                          <span className={visual.iconClass}>
                            {visual.icon === X ? (
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
                                  {renderTrailAvatar(step.key, approvalTrail)}
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
                                <span className="text-muted-foreground">{readTrailMeta(step.key, approvalTrail)}</span>
                              )}
                            </div>
                            {trailItem?.note ? (
                              <div className="mt-2 rounded-xl border border-border/55 bg-background/75 px-3 py-2 text-xs leading-5 text-muted-foreground">
                                <span className="font-medium text-foreground/85 dark:text-foreground/80">Note:</span>{" "}
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
            ) : null}

          </div>
          <UtilityRecordDetail
            record={props.selected}
            companyName={props.getCompanyName(props.selected.facilityId)}
            approvalFlow={props.approvalFlow}
          />
          <div className="rounded-[20px] border border-border/55 bg-background/92 p-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl px-4 shadow-sm"
                onClick={() =>
                  exportUtilityReport(
                    props.selected!,
                    props.getCompanyName(props.selected!.facilityId),
                    props.approvalFlow,
                  )
                }
              >
                <FileDown className="mr-2 size-4" />
                Export report
              </Button>
              {selectedTransition || reverseTransition ? (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/65 bg-background/90 p-2 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                  {selectedTransition ? (
                    <Button
                      variant="default"
                      className="h-10 rounded-xl px-4 shadow-sm"
                      onClick={() => {
                        if (!selectedTransition) return;
                        setConfirmTransitionKey(selectedTransition.key);
                      }}
                      disabled={Boolean(actionBlockReason)}
                    >
                      <Check className="mr-2 size-4" />
                      <span className="mr-2 text-white/80">Ready to</span>
                      <span className={readSelectedStatusChipClass(selectedStatusKey, true)}>{selectedStatusLabel}</span>
                    </Button>
                  ) : null}
                  <Button
                    variant="destructive"
                    className="h-10 rounded-xl px-4 shadow-sm"
                    onClick={() => {
                      if (!reverseTransition) return;
                      setConfirmTransitionKey(reverseTransition.key);
                    }}
                    disabled={!reverseTransition}
                  >
                    <X className="mr-2 size-4" />
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 px-3 py-2 text-sm text-muted-foreground">
                  No approval action is assigned to you for the current status.
                </div>
              )}
            </div>

            {actionBlockReason ? (
              <div className="mt-2 rounded-xl border border-amber-500/18 bg-amber-500/6 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
                {actionBlockReason}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </DetailPanel>
  );
}

function WorkflowConfirmOverlay(props: {
  tone: "default" | "warning";
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  note: string;
  onNoteChange: (value: string) => void;
  requireNote: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  const noteInvalid = props.requireNote && !props.note.trim();

  return (
    <div className="absolute inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[26px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 shadow-[0_24px_64px_rgba(15,23,42,0.18)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))]">
        <div
          className={
            props.tone === "warning"
              ? "mx-auto grid size-11 place-items-center rounded-full border border-amber-500/20 bg-[linear-gradient(180deg,rgba(245,158,11,0.16),rgba(245,158,11,0.06))] text-amber-700 shadow-sm dark:text-amber-300"
              : "mx-auto grid size-11 place-items-center rounded-full border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.16),rgba(16,185,129,0.06))] text-emerald-700 shadow-sm dark:text-emerald-300"
          }
        >
          {props.tone === "warning" ? <X className="size-5" /> : <Check className="size-5" />}
        </div>
        <div className="mt-3 text-center text-base font-semibold tracking-[0.01em]">{props.title}</div>
        <div className="mt-2 text-center text-sm leading-6 text-muted-foreground">{props.description}</div>
        {props.requireNote ? (
          <div className="mt-4 space-y-2 text-left">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Reject note
            </div>
            <Textarea
              value={props.note}
              onChange={(event) => props.onNoteChange(event.target.value)}
              placeholder="Write the reason for rejecting this step"
              className={noteInvalid ? "min-h-24 border-destructive" : "min-h-24"}
            />
            <div className={noteInvalid ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {noteInvalid ? "Reject note is required." : "This note will be stored in the approval history."}
            </div>
          </div>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={busy} onClick={props.onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={props.tone === "warning" ? "destructive" : "default"}
            className="h-10 rounded-xl shadow-sm"
            disabled={busy || noteInvalid}
            onClick={async () => {
              try {
                setBusy(true);
                await props.onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving..." : props.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function readTransitionBlockReason(
  flow: UtilityApprovalFlow | null,
  currentStepKey: string,
  transition: UtilityApprovalFlow["transitions"][number] | null,
  record: UtilityRecord | null,
) {
  if (!transition || !record) {
    return "";
  }
  if (getTransitionDirection(flow, currentStepKey, transition) === "reverse") {
    return "";
  }
  if (Number(record.missingDaysCount || 0) > 0) {
    return "Complete the missing dates first. Forward approval steps are blocked while month coverage is incomplete.";
  }
  if (!record.monthComplete) {
    return "This month is not complete yet. Forward approval steps become available after full month coverage.";
  }
  return "";
}

function readSelectedStatusChipClass(stepKey: string, onSolid = false) {
  const key = normalizeWorkflowStepKey(null, stepKey);
  const base = onSolid
    ? "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold text-white"
    : "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold text-foreground dark:text-foreground";

  if (key === "submitted" || key === "submit") {
    return `${base} ${onSolid ? "border-white/20 bg-white/12" : "border-sky-300/60 bg-sky-500/8"}`;
  }
  if (key === "approved" || key === "approve") {
    return `${base} ${onSolid ? "border-white/20 bg-white/12" : "border-emerald-300/60 bg-emerald-500/8"}`;
  }
  if (key === "audited" || key === "audit") {
    return `${base} ${onSolid ? "border-white/20 bg-white/12" : "border-violet-300/60 bg-violet-500/8"}`;
  }
  if (key === "draft") {
    return `${base} ${onSolid ? "border-white/20 bg-white/12" : "border-slate-300/60 bg-slate-500/8"}`;
  }
  return `${base} ${onSolid ? "border-white/20 bg-white/12" : "border-border/60 bg-muted/60"}`;
}

function buildApprovalTrail(
  record: UtilityRecord | null,
  flow: UtilityApprovalFlow | null,
  steps: ReturnType<typeof getOrderedWorkflowSteps>,
) {
  if (!record) return new Map<string, { actedBy?: string; actedAt?: string; note?: string }>();

  const trail = new Map<string, { actedBy?: string; actedAt?: string; note?: string }>();

  if (steps.some((step) => step.key === "draft")) {
    trail.set("draft", {
      actedBy: record.monthlyCreatedBy,
      actedAt: record.monthlyCreatedAt,
    });
  }

  for (const item of record.approvalHistory || []) {
    const stepKey = normalizeWorkflowStepKey(flow, item.toStepKey);
    if (!stepKey) continue;
    trail.set(stepKey, {
      actedBy: item.actedBy,
      actedAt: item.actedAt,
      note: item.note,
    });
  }

  const approvedStepKey = steps.find((step) => step.key === "approved")?.key;
  if (approvedStepKey && (record.approvedBy || record.approvedAt)) {
    trail.set(approvedStepKey, {
      actedBy: record.approvedBy,
      actedAt: record.approvedAt,
    });
  }

  return trail;
}

function readTrailMeta(stepKey: string, trail: Map<string, { actedBy?: string; actedAt?: string; note?: string }>) {
  const item = trail.get(stepKey);
  if (!item?.actedBy && !item?.actedAt) {
    return "No activity yet";
  }
  if (item?.actedBy && item?.actedAt) {
    return `${item.actedBy} • ${formatDate(item.actedAt)}`;
  }
  return item?.actedBy || (item?.actedAt ? formatDate(item.actedAt) : "No activity yet");
}

function renderTrailAvatar(stepKey: string, trail: Map<string, { actedBy?: string; actedAt?: string; note?: string }>) {
  const actedBy = String(trail.get(stepKey)?.actedBy || "").trim();
  if (!actedBy) return null;
  const initials = actedBy
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

function buildRejectedSteps(record: UtilityRecord | null, flow: UtilityApprovalFlow | null) {
  const rejected = new Set<string>();
  if (!record) return rejected;

  for (const item of record.approvalHistory || []) {
    const fromStepKey = normalizeWorkflowStepKey(flow, item.fromStepKey);
    const toStepKey = normalizeWorkflowStepKey(flow, item.toStepKey);
    if (!fromStepKey || !toStepKey) continue;

    const fromIndex = getStepIndex(flow, fromStepKey);
    const toIndex = getStepIndex(flow, toStepKey);
    if (fromIndex < 0 || toIndex < 0) continue;

    if (toIndex < fromIndex) {
      rejected.add(fromStepKey);
    } else {
      rejected.delete(toStepKey);
      for (const stepKey of Array.from(rejected)) {
        const rejectedIndex = getStepIndex(flow, stepKey);
        if (rejectedIndex <= toIndex) {
          rejected.delete(stepKey);
        }
      }
    }
  }

  return rejected;
}

function getTimelineVisual(index: number, currentIndex: number, pendingIndex: number, wasRejected: boolean) {
  const hasPreview = pendingIndex >= 0;
  const isPreviewingReverse = hasPreview && currentIndex >= 0 && pendingIndex < currentIndex;
  const isPreviewingForward = hasPreview && currentIndex >= 0 && pendingIndex > currentIndex;
  const isCanceled = (isPreviewingReverse && index > pendingIndex && index <= currentIndex) || (!hasPreview && wasRejected && index > currentIndex);
  const isSelectedTarget = hasPreview && index === pendingIndex;
  const isCompleted =
    !isCanceled &&
    currentIndex >= 0 &&
    (
      (!hasPreview && index <= currentIndex) ||
      (isPreviewingForward && index <= currentIndex) ||
      (isPreviewingReverse && index < pendingIndex)
    );
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
      iconClass: "flex size-7 animate-pulse items-center justify-center rounded-full bg-sky-500/12 text-sky-700 ring-2 ring-sky-300/40 shadow-[0_0_0_6px_rgba(56,189,248,0.07)] dark:text-sky-300",
      labelClass: "text-sm font-bold tracking-[0.01em] text-sky-700 dark:text-sky-300",
      itemClass: "rounded-2xl border border-sky-500/18 bg-[linear-gradient(180deg,rgba(14,165,233,0.10),rgba(255,255,255,0.03))] px-3.5 py-2.5 shadow-[0_10px_22px_rgba(14,165,233,0.08)]",
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
    iconClass: "flex size-7 items-center justify-center rounded-full border border-border/60 bg-muted/55 text-muted-foreground",
    labelClass: "text-sm font-semibold tracking-[0.01em] text-muted-foreground",
    itemClass: "rounded-2xl border border-border/60 bg-background/78 px-3.5 py-2.5 shadow-sm",
    lineClass: "mt-2.5 min-h-8 w-px flex-1 bg-border/80",
  };
}
