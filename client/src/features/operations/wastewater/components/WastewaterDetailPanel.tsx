import * as React from "react";
import { AlertTriangle, ExternalLink, FlaskConical, Pencil, Trash2, Upload } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { toast } from "@/core/app/lib/toast";
import type { CompanyOption } from "@/core/app/state/slices/company";
import type { WastewaterRecord } from "@/core/types/models/ems";
import { formatDate } from "@/core/utils/format";

import {
  WastewaterFormFields,
  createWastewaterFormState,
  toWastewaterRecordInput,
  validateWastewaterForm,
  type WastewaterFormState,
} from "./WastewaterFormFields";

export function WastewaterDetailPanel({
  open,
  onOpenChange,
  record,
  companies,
  getCompanyName,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: WastewaterRecord | null;
  companies: CompanyOption[];
  getCompanyName: (facilityId: string) => string;
  onSave: (
    recordId: string,
    input: ReturnType<typeof toWastewaterRecordInput>,
    reportFile: File | null,
  ) => Promise<boolean>;
  onDelete: (recordId: string) => Promise<void>;
  saving: boolean;
  deleting: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [reportFile, setReportFile] = React.useState<File | null>(null);
  const [form, setForm] = React.useState<WastewaterFormState>(() => createWastewaterFormState(record || undefined));

  React.useEffect(() => {
    if (!record) return;
    if (!editing) setForm(createWastewaterFormState(record));
  }, [editing, record]);

  React.useEffect(() => {
    setEditing(false);
    setConfirmDelete(false);
    setReportFile(null);
  }, [record?.id, open]);

  const overlay =
    record && confirmDelete ? (
      <div className="absolute inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-lg border bg-background p-5 text-center shadow-2xl">
          <div className="text-base font-semibold">Delete lab record?</div>
          <div className="text-muted-foreground mt-2 text-sm leading-6">
            This removes the <span className="font-medium text-foreground">{record.point}</span> sample and its report.
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" disabled={deleting} onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={async () => {
                await onDelete(record.id);
                setConfirmDelete(false);
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <DetailPanel
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setEditing(false);
          setConfirmDelete(false);
          setReportFile(null);
        }
        onOpenChange(nextOpen);
      }}
      title={record ? `${record.point[0].toUpperCase()}${record.point.slice(1)} sample` : "Wastewater sample"}
      description={record ? `${getCompanyName(record.facilityId)} - ${formatDate(record.sampleDate)}` : undefined}
      overlay={overlay}
    >
      {record ? (
        <div className="space-y-5">
          {editing ? (
            <>
              <WastewaterFormFields form={form} setForm={setForm} companies={companies} />
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Lab report PDF</div>
                <Input type="file" accept="application/pdf" onChange={(event) => setReportFile(event.target.files?.[0] || null)} />
                <div className="text-muted-foreground text-xs">
                  {reportFile ? `Selected: ${reportFile.name}` : "Optional. A new PDF will replace the current report after save."}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setForm(createWastewaterFormState(record));
                    setReportFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    const validationError = validateWastewaterForm(form);
                    if (validationError) return toast.error(validationError);
                    const success = await onSave(record.id, toWastewaterRecordInput(form), reportFile);
                    if (!success) return;
                    setEditing(false);
                    setReportFile(null);
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.90))]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={record.exceedance?.length ? "critical" : "compliant"}>
                        {record.exceedance?.length ? "exceedance" : "compliant"}
                      </StatusBadge>
                      <div className="bg-muted rounded-full px-2.5 py-1 text-xs font-medium capitalize">
                        {record.point}
                      </div>
                    </div>
                    {record.exceedance?.length ? (
                      <div className="text-destructive inline-flex items-center gap-1 text-xs font-medium">
                        <AlertTriangle className="size-3.5" />
                        {record.exceedance.join(", ")}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditing(true)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </Button>
                    <Button type="button" className="rounded-xl" onClick={() => setEditing(true)}>
                      <Upload className="mr-2 size-4" />
                      Replace report
                    </Button>
                    <Button type="button" variant="destructive" className="rounded-xl" onClick={() => setConfirmDelete(true)}>
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-border/70 bg-background p-4 sm:grid-cols-2">
                <DetailItem label="Company" value={getCompanyName(record.facilityId)} />
                <DetailItem label="Sample date" value={formatDate(record.sampleDate)} />
                <DetailItem label="Point" value={record.point} />
                <DetailItem label="DO" value={record.DO == null ? "-" : String(record.DO)} />
                <DetailItem label="pH" value={String(record.pH)} />
                <DetailItem label="COD" value={`${record.COD} mg/L`} />
                <DetailItem label="BOD" value={`${record.BOD} mg/L`} />
                <DetailItem label="TSS" value={`${record.TSS} mg/L`} />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-4" />
                  <div className="text-xs font-semibold">Lab report</div>
                </div>
                {record.labReport ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{record.labReport.fileName}</div>
                      <div className="text-muted-foreground mt-1 text-xs">{formatDate(record.labReport.uploadedAt)}</div>
                    </div>
                    {record.labReport.url ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={record.labReport.url} target="_blank" rel="noreferrer">
                          Open
                          <ExternalLink className="ml-2 size-4" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-muted-foreground mt-3 text-sm">No lab report uploaded yet.</div>
                )}
              </div>

              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="text-xs font-semibold">Notes</div>
                <div className="text-muted-foreground mt-2 text-sm leading-6">{record.notes || "No notes added."}</div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </DetailPanel>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize">{value}</div>
    </div>
  );
}
