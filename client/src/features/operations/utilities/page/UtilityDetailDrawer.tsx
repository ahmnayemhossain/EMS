import * as React from "react";
import { Check, CheckCheck, ChevronDown, Circle, Edit, Send, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { Button } from "@/components/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { UtilityRecordDetail } from "@/features/operations/utilities/components/UtilityRecordDetail";
import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";
import { formatDate, formatUtilityType } from "@/core/utils/format";
import { getStepName, getWorkflowStatus } from "@/features/operations/utilities/hooks/approval-flow";
import {
  canUseHighLevelReverse,
  getOrderedWorkflowSteps,
  getStepIndex,
  getTransitionDirection,
  isWorkflowTransitionBlocked,
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
  onTransitionMonth: (transitionKey: string) => void | Promise<void>;
}) {
  const [confirmTransitionKey, setConfirmTransitionKey] = React.useState("");
  const [selectedTransitionKey, setSelectedTransitionKey] = React.useState("");
  const description = props.selected
    ? `${props.companies.find((company) => company.id === props.selected?.facilityId)?.name || "Company"} • ${formatDate(props.selected.periodStart)} to ${formatDate(props.selected.periodEnd)}`
    : undefined;

  React.useEffect(() => {
    if (!props.selected) {
      setConfirmTransitionKey("");
      setSelectedTransitionKey("");
    }
  }, [props.selected]);

  const currentStepKey = String(props.approvalFlow?.currentStepKey || props.selected?.approvalStatus || "draft").trim().toLowerCase() || "draft";
  const actionTransitions = React.useMemo(
    () =>
      props.approvalFlow?.currentStepKey
        ? props.approvalFlow.transitions || []
        : (props.approvalFlow?.transitions || []).filter((transition) => transition.fromStepKey === currentStepKey),
    [props.approvalFlow, currentStepKey],
  );
  const { forward: forwardTransitions, reverse: reverseTransitions } = React.useMemo(
    () => splitTransitionsByDirection(props.approvalFlow, currentStepKey, actionTransitions),
    [props.approvalFlow, currentStepKey, actionTransitions],
  );
  const primaryTransition = forwardTransitions[0] || null;
  const reverseTransition = React.useMemo(() => {
    if (!canUseHighLevelReverse(props.approvalFlow, currentStepKey, props.approvalFlow?.transitions || [])) {
      return null;
    }
    return reverseTransitions[0] || null;
  }, [props.approvalFlow, currentStepKey, reverseTransitions]);
  const selectedTransition =
    forwardTransitions.find((transition) => transition.key === selectedTransitionKey) ||
    primaryTransition ||
    null;
  const pendingTransition = actionTransitions.find((transition) => transition.key === confirmTransitionKey) || null;
  const previewTransition =
    pendingTransition ||
    (selectedTransitionKey
      ? forwardTransitions.find((transition) => transition.key === selectedTransitionKey) || null
      : null);
  const selectableTransitions = forwardTransitions;
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
  const selectedStatusLabel = pendingTransition
    ? readWorkflowStatusLabel(pendingTransition.toStepKey, props.approvalFlow)
    : selectedTransition
      ? readWorkflowStatusLabel(selectedTransition.toStepKey, props.approvalFlow)
      : "No status";

  React.useEffect(() => {
    if (!actionTransitions.length) {
      setSelectedTransitionKey("");
      setConfirmTransitionKey("");
      return;
    }
    setSelectedTransitionKey((current) => {
      if (current && forwardTransitions.some((transition) => transition.key === current)) {
        return current;
      }
      return primaryTransition?.key || "";
    });
    setConfirmTransitionKey((current) =>
      current && actionTransitions.some((transition) => transition.key === current) ? current : "",
    );
  }, [actionTransitions, primaryTransition?.key]);

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
            onCancel={() => setConfirmTransitionKey("")}
            onConfirm={async () => {
              await props.onTransitionMonth(pendingTransition.key);
              setConfirmTransitionKey("");
            }}
          />
        ) : null
      }
    >
      {props.selected ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.05),rgba(16,185,129,0.02))] p-4 shadow-[0_10px_24px_rgba(16,185,129,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Approval flow
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={workflowStatus?.tone || "neutral"} className="rounded-full">
                    {workflowStatus?.label || getStepName(props.approvalFlow, currentStepKey)}
                  </StatusBadge>
                  <span className="text-sm font-medium">
                    Current: {getStepName(props.approvalFlow, currentStepKey)}
                  </span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {pendingTransition
                    ? `Next step: ${getStepName(props.approvalFlow, pendingTransition.toStepKey)}`
                    : selectedTransition
                      ? `Next step: ${getStepName(props.approvalFlow, selectedTransition.toStepKey)}`
                      : actionTransitions.length === 0
                        ? "No approval action is assigned to you for the current status."
                        : workflowStatus?.detail || "No workflow action available."}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={props.onEdit}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={props.onDelete} disabled={!props.canDelete}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>

            {orderedSteps.length ? (
              <div className="mt-4 rounded-2xl border border-border/60 bg-background/55 p-3 shadow-sm">
                <div className="space-y-0">
                  {orderedSteps.map((step, index) => {
                    const visual = getTimelineVisual(index, currentStepIndex, pendingStepIndex);
                    const Icon = visual.icon;
                    const isLast = index === orderedSteps.length - 1;
                    return (
                      <div key={step.key} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
                        <div className="flex flex-col items-center">
                          <span className={visual.iconClass}>
                            <Icon className={visual.icon === X ? "size-4 stroke-[2.6]" : "size-3.5"} />
                          </span>
                          {!isLast ? <span className={visual.lineClass} /> : null}
                        </div>
                        <div className={visual.itemClass}>
                          <div className="min-w-0">
                            <div className={visual.labelClass}>{step.name}</div>
                            <div className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                              {readTrailMeta(step.key, approvalTrail)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {selectedTransition || reverseTransition ? (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 p-1.5 shadow-sm">
                    {selectedTransition ? (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 rounded-lg px-3 text-sm font-medium" disabled={Boolean(actionBlockReason)}>
                              <span>Status: {selectedStatusLabel}</span>
                              <ChevronDown className="ml-2 size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="max-h-40 min-w-52 overflow-y-auto rounded-xl">
                            {selectableTransitions.map((transition) => (
                              <DropdownMenuItem
                                key={transition.key}
                                onClick={() => {
                                  setSelectedTransitionKey(transition.key);
                                  setConfirmTransitionKey("");
                                }}
                                disabled={isWorkflowTransitionBlocked(props.approvalFlow, currentStepKey, transition, props.selected)}
                                className="gap-2 rounded-lg"
                              >
                                {readTransitionIconCompact(transition.toStepKey)}
                                <span>{readWorkflowStatusLabel(transition.toStepKey, props.approvalFlow)}</span>
                                {selectedTransitionKey === transition.key ? <Check className="ml-auto size-3.5" /> : null}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="default"
                          className="h-9 rounded-lg px-3"
                          onClick={() => {
                            if (!selectedTransition) return;
                            setConfirmTransitionKey(selectedTransition.key);
                          }}
                          disabled={Boolean(actionBlockReason)}
                        >
                          <Check className="mr-2 size-4" />
                          Save
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="outline"
                      className="h-9 rounded-lg px-3"
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
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 px-3 py-2 text-sm text-muted-foreground">
                  No approval action is assigned to you for the current status.
                </div>
              )}
            </div>

            {actionBlockReason ? (
              <div className="text-muted-foreground mt-2 text-sm">{actionBlockReason}</div>
            ) : null}
          </div>
          <UtilityRecordDetail
            record={props.selected}
            companyName={props.getCompanyName(props.selected.facilityId)}
            approvalFlow={props.approvalFlow}
          />
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
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="absolute inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-5 text-center shadow-2xl">
        <div
          className={
            props.tone === "warning"
              ? "mx-auto grid size-11 place-items-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "mx-auto grid size-11 place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          }
        >
          {props.tone === "warning" ? <X className="size-5" /> : <Check className="size-5" />}
        </div>
        <div className="mt-3 text-base font-semibold">{props.title}</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">{props.description}</div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={props.onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={props.tone === "warning" ? "secondary" : "default"}
            disabled={busy}
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

function readTransitionIconCompact(stepKey: string) {
  const Icon = resolveTransitionIcon(stepKey);
  return <Icon className="size-4" />;
}

function resolveTransitionIcon(stepKey: string) {
  const key = String(stepKey || "").trim().toLowerCase();
  if (key === "submitted" || key === "submit") return Send;
  if (key === "checked" || key === "check") return CheckCheck;
  if (key === "recommended" || key === "recommend") return Sparkles;
  if (key === "approved" || key === "approve") return ShieldCheck;
  return Send;
}

function buildApprovalTrail(
  record: UtilityRecord | null,
  flow: UtilityApprovalFlow | null,
  steps: ReturnType<typeof getOrderedWorkflowSteps>,
) {
  if (!record) return new Map<string, { actedBy?: string; actedAt?: string }>();

  const trail = new Map<string, { actedBy?: string; actedAt?: string }>();

  if (steps.some((step) => step.key === "draft")) {
    trail.set("draft", {
      actedBy: record.monthlyCreatedBy,
      actedAt: record.monthlyCreatedAt,
    });
  }

  for (const item of record.approvalHistory || []) {
    const stepKey = String(item.toStepKey || "").trim().toLowerCase();
    if (!stepKey) continue;
    trail.set(stepKey, {
      actedBy: item.actedBy,
      actedAt: item.actedAt,
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

function readTrailMeta(stepKey: string, trail: Map<string, { actedBy?: string; actedAt?: string }>) {
  const item = trail.get(stepKey);
  if (!item?.actedBy && !item?.actedAt) {
    return "No activity yet";
  }
  if (item?.actedBy && item?.actedAt) {
    return `${item.actedBy} • ${formatDate(item.actedAt)}`;
  }
  return item?.actedBy || (item?.actedAt ? formatDate(item.actedAt) : "No activity yet");
}

function getTimelineVisual(index: number, currentIndex: number, pendingIndex: number) {
  const hasPreview = pendingIndex >= 0;
  const isPreviewingReverse = hasPreview && currentIndex >= 0 && pendingIndex < currentIndex;
  const isPreviewingForward = hasPreview && currentIndex >= 0 && pendingIndex > currentIndex;
  const isCanceled = isPreviewingReverse && index > pendingIndex && index <= currentIndex;
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
        "flex size-7 items-center justify-center rounded-full border border-rose-400/30 bg-[linear-gradient(180deg,rgba(251,113,133,0.20),rgba(251,113,133,0.08))] text-rose-700 shadow-sm dark:border-rose-400/20 dark:text-rose-300",
      labelClass: "text-sm font-bold text-rose-700 dark:text-rose-300",
      itemClass:
        "rounded-xl border border-rose-400/20 bg-[linear-gradient(180deg,rgba(251,113,133,0.10),rgba(255,255,255,0.02))] px-3 py-2 shadow-[0_10px_24px_rgba(244,63,94,0.10)]",
      lineClass: "mt-1 min-h-6 w-px flex-1 bg-rose-300/70",
    };
  }
  if (isSelectedTarget || isNextAction) {
    return {
      icon: Circle,
      iconClass: "flex size-7 animate-pulse items-center justify-center rounded-full bg-sky-500/12 text-sky-700 ring-2 ring-sky-300/45 dark:text-sky-300",
      labelClass: "text-sm font-bold text-sky-700 dark:text-sky-300",
      itemClass: "rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 shadow-sm",
      lineClass: "mt-1 min-h-6 w-px flex-1 bg-sky-300/70",
    };
  }
  if (isCompleted) {
    return {
      icon: Check,
      iconClass:
        "flex size-7 items-center justify-center rounded-full border border-emerald-400/30 bg-[linear-gradient(180deg,rgba(16,185,129,0.20),rgba(16,185,129,0.08))] text-emerald-700 shadow-sm dark:border-emerald-400/20 dark:text-emerald-300",
      labelClass: "text-sm font-bold text-emerald-900 dark:text-emerald-100",
      itemClass:
        "rounded-xl border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02))] px-3 py-2 shadow-[0_10px_24px_rgba(16,185,129,0.10)]",
      lineClass: "mt-1 min-h-6 w-px flex-1 bg-emerald-300/70",
    };
  }
  return {
    icon: Circle,
    iconClass: "flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground",
    labelClass: "text-sm font-semibold text-muted-foreground",
    itemClass: "rounded-xl border border-border/70 bg-background/70 px-3 py-2 shadow-sm",
    lineClass: "mt-1 min-h-6 w-px flex-1 bg-border",
  };
}
