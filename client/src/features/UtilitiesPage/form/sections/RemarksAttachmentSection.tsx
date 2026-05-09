import * as React from "react";
import { FileText, UploadCloud, X } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { Textarea } from "@/core/app/components/ui/textarea";
import { cn } from "@/core/app/components/ui/utils";
import { utilityAttachmentConfig } from "@/features/UtilitiesPage/constants";
import { FieldError, FieldLabel, FormSection } from "@/features/UtilitiesPage/form/form-ui";
import type { UtilityFormProps } from "@/features/UtilitiesPage/form/types";

export function RemarksAttachmentSection({ props }: { props: UtilityFormProps }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const previewUrl = React.useMemo(
    () => (props.attachment ? URL.createObjectURL(props.attachment) : ""),
    [props.attachment],
  );

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  function applyFile(file: File | null) {
    if (!file) return;
    props.onAttachmentChange(file);
  }

  return (
    <FormSection title="Notes">
      <div className="grid gap-3">
        <div className="grid gap-1.5"><FieldLabel>Remarks</FieldLabel><Textarea value={props.remarks} onChange={(event) => props.onRemarksChange(event.target.value)} placeholder="Optional remarks" /></div>
        <div className="grid gap-1.5">
          <FieldLabel>Attachment</FieldLabel>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={utilityAttachmentConfig.accept}
            onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              applyFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "flex w-full min-w-0 flex-col gap-3 rounded-xl border border-dashed bg-muted/5 px-4 py-4 text-left transition-colors",
              dragActive && "border-primary bg-primary/5",
            )}
          >
            {props.attachment ? (
              <div className="grid gap-3">
                <div className="relative overflow-hidden rounded-xl border bg-background">
                  {previewUrl ? (
                    <object data={previewUrl} type="application/pdf" className="h-44 w-full">
                      <div className="flex h-44 items-center justify-center">
                        <FileText className="text-muted-foreground size-10" />
                      </div>
                    </object>
                  ) : (
                    <div className="flex h-44 items-center justify-center">
                      <FileText className="text-muted-foreground size-10" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 z-10 size-8 rounded-full shadow-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.onAttachmentChange(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="min-w-0 px-1">
                  <div className="truncate text-sm font-medium">{props.attachment.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {(props.attachment.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-3">
                <div className="bg-muted/60 flex size-9 shrink-0 items-center justify-center rounded-lg border">
                  <UploadCloud className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">Drag & drop PDF here</div>
                  <div className="text-muted-foreground text-xs">or click to choose file</div>
                </div>
              </div>
            )}
          </button>
          <div className="text-muted-foreground text-xs">PDF only, up to 10 MB.</div>
          <FieldError />
        </div>
      </div>
    </FormSection>
  );
}
