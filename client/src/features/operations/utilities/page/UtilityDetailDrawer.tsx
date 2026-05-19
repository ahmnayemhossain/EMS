import * as React from "react";
import { CheckCheck, ChevronDown, Edit, RotateCcw, Send, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { UtilityRecordDetail } from "@/features/operations/utilities/components/UtilityRecordDetail";
import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";
import { formatDate, formatUtilityType } from "@/core/utils/format";
import { getStepName } from "@/features/operations/utilities/hooks/approval-flow";

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
  const description = props.selected
    ? `${props.companies.find((company) => company.id === props.selected?.facilityId)?.name || "Company"} • ${formatDate(props.selected.periodStart)} to ${formatDate(props.selected.periodEnd)}`
    : undefined;

  React.useEffect(() => {
    if (!props.selected) {
      setConfirmTransitionKey("");
    }
  }, [props.selected]);

  const currentStepKey = String(props.selected?.approvalStatus || "draft").trim().toLowerCase() || "draft";
  const actionTransitions = (props.approvalFlow?.transitions || []).filter((transition) => transition.fromStepKey === currentStepKey);
  const pendingTransition = actionTransitions.find((transition) => transition.key === confirmTransitionKey) || null;
  const primaryTransition = pickPrimaryTransition(actionTransitions);
  const secondaryTransitions = primaryTransition
    ? actionTransitions.filter((transition) => transition.key !== primaryTransition.key)
    : [];

  return (
    <DetailPanel
      open={Boolean(props.selected)}
      onOpenChange={(open) => {
        if (!open) props.onSelect(null);
      }}
      title={props.selected ? `${formatUtilityType(props.selected.type)} — ${props.selected.meterName}` : "Utility record"}
      description={description}
    >
      {props.selected ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={props.onEdit}>
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
            {primaryTransition ? (
              <div className="flex items-center gap-2">
                <Button
                  variant={primaryTransition.toStepKey === "draft" ? "outline" : "default"}
                  onClick={() => setConfirmTransitionKey(primaryTransition.key)}
                  disabled={isTransitionBlocked(primaryTransition, props.selected)}
                >
                  {readTransitionIcon(primaryTransition.toStepKey)}
                  {readActionLabel(primaryTransition.toStepKey, props.approvalFlow)}
                </Button>
                {secondaryTransitions.length ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-44 rounded-xl">
                      {secondaryTransitions.map((transition) => (
                        <DropdownMenuItem
                          key={transition.key}
                          onClick={() => setConfirmTransitionKey(transition.key)}
                          disabled={isTransitionBlocked(transition, props.selected)}
                          className="gap-2"
                        >
                          {readTransitionIconCompact(transition.toStepKey)}
                          <span>{readActionLabel(transition.toStepKey, props.approvalFlow)}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            ) : (
              <Button variant="outline" disabled>
                No action
              </Button>
            )}
            <Button variant="destructive" onClick={props.onDelete} disabled={!props.canDelete}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </div>
          {pendingTransition ? (
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 shadow-[0_10px_24px_rgba(16,185,129,0.08)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">
                    {readActionLabel(pendingTransition.toStepKey, props.approvalFlow)} this month?
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Current: {getStepName(props.approvalFlow, props.selected?.approvalStatus)}. Next: {getStepName(props.approvalFlow, pendingTransition.toStepKey)}.
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setConfirmTransitionKey("")}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      await props.onTransitionMonth(pendingTransition.key);
                      setConfirmTransitionKey("");
                    }}
                  >
                    {readActionLabel(pendingTransition.toStepKey, props.approvalFlow)}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
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

function pickPrimaryTransition(transitions: UtilityApprovalFlow["transitions"]) {
  return transitions.find((transition) => transition.toStepKey !== "draft") || transitions[0] || null;
}

function isTransitionBlocked(transition: UtilityApprovalFlow["transitions"][number], record: UtilityRecord | null) {
  return transition.toStepKey !== "draft" && (!record?.monthComplete || Number(record?.missingDaysCount || 0) > 0);
}

function readActionLabel(stepKey: string, flow: UtilityApprovalFlow | null) {
  const label = getStepName(flow, stepKey).trim();
  return label || "Submit";
}

function readTransitionIcon(stepKey: string) {
  const Icon = resolveTransitionIcon(stepKey);
  return <Icon className="mr-2 size-4" />;
}

function readTransitionIconCompact(stepKey: string) {
  const Icon = resolveTransitionIcon(stepKey);
  return <Icon className="size-4" />;
}

function resolveTransitionIcon(stepKey: string) {
  const key = String(stepKey || "").trim().toLowerCase();
  if (key === "draft") return RotateCcw;
  if (key === "submitted" || key === "submit") return Send;
  if (key === "checked" || key === "check") return CheckCheck;
  if (key === "recommended" || key === "recommend") return Sparkles;
  if (key === "approved" || key === "approve") return ShieldCheck;
  return Send;
}
