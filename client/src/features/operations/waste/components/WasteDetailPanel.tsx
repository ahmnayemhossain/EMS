import * as React from "react";
import { ExternalLink, FileText, Pencil, Trash2, Upload } from "lucide-react";

import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { toast } from "@/core/app/lib/toast";
import type { CompanyOption } from "@/core/app/state/slices/company";
import type { WasteRecord } from "@/core/types/models/ems";
import { formatDate, formatNumber } from "@/core/utils/format";

import {
  WasteFormFields,
  createWasteFormState,
  toWasteRecordInput,
  validateWasteForm,
  type WasteFormState,
} from "./WasteFormFields";

function toneForWasteType(type: WasteRecord["type"]) {
  if (type === "hazardous" || type === "sludge") return "warning";
  if (type === "e_waste") return "info";
  return "compliant";
}

function toneForDisposal(status: WasteRecord["disposalStatus"]) {
  if (status === "disposed") return "compliant";
  if (status === "scheduled") return "warning";
  return "critical";
}

export function WasteDetailPanel({
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
  record: WasteRecord | null;
  companies: CompanyOption[];
  getCompanyName: (facilityId: string) => string;
  onSave: (recordId: string, input: ReturnType<typeof toWasteRecordInput>, attachmentFile: File | null) => Promise<boolean>;
  onDelete: (recordId: string) => Promise<void>;
  saving: boolean;
  deleting: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null);
  const [form, setForm] = React.useState<WasteFormState>(() => createWasteFormState(record || undefined));

  React.useEffect(() => {
    if (!record) return;
    if (!editing) setForm(createWasteFormState(record));
  }, [editing, record]);

  React.useEffect(() => {
    setEditing(false);
    setConfirmDelete(false);
    setAttachmentFile(null);
  }, [record?.id, open]);

  const overlay =
    record && confirmDelete ? (
      <div className="absolute inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-lg border bg-background p-5 text-center shadow-2xl">
          <div className="text-base font-semibold">Delete waste record?</div>
          <div className="text-muted-foreground mt-2 text-sm leading-6">
            This removes <span className="font-medium text-foreground">{record.stream}</span> and its attachments.
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
          setAttachmentFile(null);
        }
        onOpenChange(nextOpen);
      }}
      title={record?.stream || "Waste record"}
      description={record ? `${getCompanyName(record.facilityId)} - ${formatDate(record.date)}` : undefined}
      overlay={overlay}
    >
      {record ? (
        <div className="space-y-5">
          {editing ? (
            <>
              <WasteFormFields form={form} setForm={setForm} companies={companies} />
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Manifest / disposal PDF</div>
                <Input type="file" accept="application/pdf" onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)} />
                <div className="text-muted-foreground text-xs">
                  {attachmentFile ? `Selected: ${attachmentFile.name}` : "Optional. A new PDF will be added after save."}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setForm(createWasteFormState(record));
                    setAttachmentFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    const validationError = validateWasteForm(form);
                    if (validationError) return toast.error(validationError);
                    const success = await onSave(record.id, toWasteRecordInput(form), attachmentFile);
                    if (!success) return;
                    setEditing(false);
                    setAttachmentFile(null);
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={toneForWasteType(record.type)}>{record.type.replace(/_/g, " ")}</StatusBadge>
                <StatusBadge tone={toneForDisposal(record.disposalStatus)}>{record.disposalStatus}</StatusBadge>
                <div className="text-muted-foreground text-xs">Qty {formatNumber(record.qtyKg)} kg</div>
              </div>

              <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                <DetailItem label="Company" value={getCompanyName(record.facilityId)} />
                <DetailItem label="Date" value={formatDate(record.date)} />
                <DetailItem label="Storage location" value={record.storageLocation} />
                <DetailItem label="Vendor" value={record.vendor || "-"} />
                <DetailItem label="Manifest no." value={record.manifestNo || "-"} />
                <DetailItem label="Due by" value={record.dueBy ? formatDate(record.dueBy) : "-"} />
              </div>

              <div className="rounded-xl border p-4">
                <div className="text-xs font-semibold">Notes</div>
                <div className="text-muted-foreground mt-2 text-sm leading-6">{record.notes || "No notes added."}</div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <FileText className="size-4" />
                  <div className="text-xs font-semibold">Attachments</div>
                </div>
                {record.files?.length ? (
                  <div className="mt-3 space-y-2">
                    {record.files.map((file) => (
                      <div
                        key={`${file.id || file.storagePath || file.name}`}
                        className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{file.name}</div>
                          <div className="text-muted-foreground mt-1 text-xs">{formatDate(file.uploadedAt)}</div>
                        </div>
                        {file.url ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={file.url} target="_blank" rel="noreferrer">
                              Open
                              <ExternalLink className="ml-2 size-4" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground mt-3 text-sm">No attachment uploaded yet.</div>
                )}
              </div>

              <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
                <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                  <Button type="button" onClick={() => setEditing(true)}>
                    <Upload className="mr-2 size-4" />
                    Add file / update
                  </Button>
                </div>
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
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
