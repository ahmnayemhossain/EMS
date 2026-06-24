import * as React from "react";
import { Check, Edit, FileDown, Trash2, X } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { Button } from "@/components/ui/primitives/button";
import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";
import { formatDate, formatUtilityType } from "@/core/utils/format";
import { UtilityRecordDetail } from "@/features/operations/utilities/components/UtilityRecordDetail";
import { getStepName, getWorkflowStatus } from "@/features/operations/utilities/hooks/approval-flow";
import { exportUtilityReport } from "@/features/operations/utilities/utils/export-utility-report";
import { UtilityWorkflowTimeline } from "@/features/operations/utilities/components/UtilityWorkflowTimeline";
import { buildApprovalTrail, buildRejectedSteps } from "@/features/operations/utilities/utils/utility-workflow-trail";
import { WorkflowConfirmOverlay } from "@/features/operations/utilities/components/WorkflowConfirmOverlay";
import {
  getOrderedWorkflowSteps,
  getStepIndex,
  getTransitionDirection,
  normalizeWorkflowStepKey,
  readWorkflowConfirmDescription,
  readWorkflowConfirmTitle,
  readWorkflowStatusLabel,
  splitTransitionsByDirection,
} from "@/features/operations/utilities/utils/workflow-ui";

type UtilityDetailDrawerProps = {
  selected: UtilityRecord | null;
  companies: Array<{ id: string; name: string }>;
  getCompanyName: (id: string) => string;
  approvalFlow: UtilityApprovalFlow | null;
  canDelete: boolean;
  onSelect: (record: UtilityRecord | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  onTransitionMonth: (transitionKey: string, note?: string) => void | Promise<void>;
};

export function UtilityDetailDrawer(props: UtilityDetailDrawerProps) {
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
            (transition) =>
              normalizeWorkflowStepKey(props.approvalFlow, transition.fromStepKey) === currentStepKey,
          ),
    [props.approvalFlow, currentStepKey],
  );

  const { forward: forwardTransitions, reverse: reverseTransitions } = React.useMemo(
    () => splitTransitionsByDirection(props.approvalFlow, currentStepKey, actionTransitions),
    [props.approvalFlow, currentStepKey, actionTransitions],
  );

  const primaryTransition = forwardTransitions[0] || null;
  const reverseTransition = reverseTransitions[0] || null;
  const pendingTransition =
    actionTransitions.find((transition) => transition.key === confirmTransitionKey) || null;
  const workflowStatus = props.selected
    ? getWorkflowStatus(props.selected, props.approvalFlow)
    : null;
  const actionBlockReason = readTransitionBlockReason(
    props.approvalFlow,
    currentStepKey,
    primaryTransition,
    props.selected,
  );
  const orderedSteps = React.useMemo(
    () => getOrderedWorkflowSteps(props.approvalFlow),
    [props.approvalFlow],
  );
  const currentStepIndex = getStepIndex(props.approvalFlow, currentStepKey);
  const pendingStepIndex = pendingTransition
    ? getStepIndex(props.approvalFlow, pendingTransition.toStepKey)
    : -1;
  const approvalTrail = React.useMemo(
    () => buildApprovalTrail(props.selected, props.approvalFlow, orderedSteps),
    [props.selected, props.approvalFlow, orderedSteps],
  );
  const rejectedSteps = React.useMemo(
    () => buildRejectedSteps(props.selected, props.approvalFlow),
    [props.selected, props.approvalFlow],
  );
  const selectedStatusLabel = primaryTransition
    ? readWorkflowStatusLabel(primaryTransition.toStepKey, props.approvalFlow)
    : "No status";
  const selectedStatusKey = primaryTransition?.toStepKey || "";

  React.useEffect(() => {
    if (!actionTransitions.length) {
      setConfirmTransitionKey("");
    }
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
            tone={
              getTransitionDirection(props.approvalFlow, currentStepKey, pendingTransition) === "reverse"
                ? "warning"
                : "default"
            }
            title={readWorkflowConfirmTitle(
              getTransitionDirection(props.approvalFlow, currentStepKey, pendingTransition),
            )}
            description={readWorkflowConfirmDescription(
              props.approvalFlow,
              currentStepKey,
              pendingTransition.toStepKey,
            )}
            confirmLabel={
              getTransitionDirection(props.approvalFlow, currentStepKey, pendingTransition) === "reverse"
                ? "Reject"
                : "Save"
            }
            note={confirmNote}
            onNoteChange={setConfirmNote}
            requireNote={
              getTransitionDirection(props.approvalFlow, currentStepKey, pendingTransition) === "reverse"
            }
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
                <Button
                  variant="destructive"
                  className="h-10 rounded-xl px-4"
                  onClick={props.onDelete}
                  disabled={!props.canDelete}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>

            <UtilityWorkflowTimeline
              orderedSteps={orderedSteps}
              currentStepIndex={currentStepIndex}
              pendingStepIndex={pendingStepIndex}
              rejectedSteps={rejectedSteps}
              approvalTrail={approvalTrail}
            />
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
              {primaryTransition || reverseTransition ? (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/65 bg-background/90 p-2 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                  {primaryTransition ? (
                    <Button
                      variant="default"
                      className="h-10 rounded-xl px-4 shadow-sm"
                      onClick={() => setConfirmTransitionKey(primaryTransition.key)}
                      disabled={Boolean(actionBlockReason)}
                    >
                      <Check className="mr-2 size-4" />
                      <span className="mr-2 text-white/80">Ready to</span>
                      <span className={readSelectedStatusChipClass(selectedStatusKey, true)}>
                        {selectedStatusLabel}
                      </span>
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
