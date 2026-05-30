import * as React from "react";
import { Droplets, FileText, Gauge } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { UtilityApprovalFlow, UtilityRecord } from "@/core/types/models/ems";
import { formatDate, formatNumber, formatUtilityType } from "@/core/utils/format";
import { formatMissingRanges, getWorkflowStatus } from "@/features/operations/utilities/hooks/approval-flow";

export function UtilityRecordDetail({
  record,
  companyName,
  approvalFlow,
}: {
  record: UtilityRecord;
  companyName: string;
  approvalFlow?: UtilityApprovalFlow | null;
}) {
  const workflow = getWorkflowStatus(record, approvalFlow);
  const varianceTone =
    record.varianceFlag === "high"
      ? "critical"
      : record.varianceFlag === "watch"
        ? "warning"
        : "compliant";

  return (
    <div className="overflow-hidden rounded-[18px] border border-border/70 bg-card/70">
      <DetailListRow label="Company" value={companyName} subvalue={record.meterName} />
      <DetailListRow
        label="Utility"
        value={formatUtilityType(record.type)}
        subvalue={record.sourceName || "Source not set"}
      />
      <DetailListRow
        label="Period"
        value={`${formatDate(record.periodStart)} → ${formatDate(record.periodEnd)}`}
        subvalue={record.periodMonth ? formatDate(record.periodMonth) : ""}
      />
      <DetailListRow
        label="Workflow"
        value={
          <StatusBadge tone={workflow.tone} className="rounded-full">
            {workflow.label}
          </StatusBadge>
        }
        subvalue={
          record.approvedBy
            ? `Approved by ${record.approvedBy}`
            : workflow.detail
        }
      />
      <DetailListRow
        label="Coverage"
        value={
          typeof record.coverageDays === "number" && typeof record.monthDays === "number"
            ? `${record.coverageDays}/${record.monthDays} day(s)`
            : "—"
        }
        subvalue={
          Number(record.missingDaysCount || 0) > 0
            ? formatMissingRanges(record.missingRanges)
            : "Full month covered"
        }
      />
      <DetailListRow
        label="Readings"
        value={
          typeof record.previousReading === "number" || typeof record.currentReading === "number"
            ? `${formatOptional(record.previousReading)} → ${formatOptional(record.currentReading)} ${record.uom}`
            : "—"
        }
        icon={<Gauge className="size-3.5" />}
      />
      <DetailListRow
        label="Usage"
        value={`${formatNumber(record.value)} ${record.uom}`}
        subvalue={
          typeof record.dieselLiters === "number"
            ? `Diesel: ${formatNumber(record.dieselLiters)} L`
            : ""
        }
        icon={typeof record.dieselLiters === "number" ? <Droplets className="size-3.5" /> : undefined}
      />
      {typeof record.baselineValue === "number" ? (
        <DetailListRow
          label="Baseline"
          value={`${formatNumber(record.baselineValue)} ${record.uom}`}
          subvalue={
            typeof record.variancePercent === "number"
              ? `Variance ${formatNumber(record.variance ?? 0)} ${record.uom} • ${record.variancePercent.toFixed(1)}%`
              : ""
          }
        />
      ) : null}
      <DetailListRow
        label="Variance"
        value={
          <StatusBadge tone={varianceTone} className="rounded-full">
            {record.varianceFlag ?? "normal"}
          </StatusBadge>
        }
      />
      <DetailListRow
        label="Bill files"
        value={
          record.billFiles?.length ? (
            <div className="space-y-1">
              {record.billFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-end gap-2">
                  <FileText className="size-3.5 text-muted-foreground" />
                  {file.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm hover:underline"
                    >
                      {file.name}
                    </a>
                  ) : (
                    <span className="text-sm">{file.name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            "No files attached"
          )
        }
      />
      <DetailListRow label="Remarks" value={record.remarks || "—"} multiline />
    </div>
  );
}

function DetailListRow({
  label,
  value,
  subvalue,
  icon,
  multiline = false,
}: {
  label: string;
  value: React.ReactNode;
  subvalue?: React.ReactNode;
  icon?: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 px-4 py-3 last:border-b-0">
      <div className="text-muted-foreground pt-0.5 text-xs font-medium">{label}</div>
      <div className="min-w-0 flex-1 text-right">
        <div className={multiline ? "break-words text-sm" : "flex items-center justify-end gap-2 text-sm font-medium"}>
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
          <span>{value}</span>
        </div>
        {subvalue ? (
          <div className="text-muted-foreground mt-1 text-xs">{subvalue}</div>
        ) : null}
      </div>
    </div>
  );
}

function formatOptional(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return formatNumber(value);
}
