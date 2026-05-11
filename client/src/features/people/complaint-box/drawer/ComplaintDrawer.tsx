import * as React from "react";

import { Dialog, DialogContent } from "@/components/ui/primitives/dialog";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { getFacilityName } from "@/core/data/catalog/mock";
import type { ReportBoxReport } from "@/core/types/models/ems";

import { formatReportNumber } from "@/features/people/complaint-box/config/utils";
import { ComplaintDrawerBody } from "@/features/people/complaint-box/drawer/ComplaintDrawerBody";

export function ComplaintDrawer({
  open,
  onOpenChange,
  complaint,
  currentUserLabel,
  reportAssignees,
  addRecord,
  onSwitchToRecords,
  onRequestDeleteComplaint,
  setSubject,
  setCategory,
  assignTo,
  toggleFlag,
  setStatus,
  addMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: ReportBoxReport | null;
  currentUserLabel: string;
  reportAssignees: string[];
  addRecord: (reportId: string) => string | undefined;
  onSwitchToRecords: () => void;
  onRequestDeleteComplaint: (report: ReportBoxReport) => void;
  setSubject: (id: string, subject: string) => void;
  setCategory: (id: string, category?: string) => void;
  assignTo: (id: string, assignedTo?: string) => void;
  toggleFlag: (id: string) => void;
  setStatus: (id: string, status: ReportBoxReport["status"], meta?: any) => void;
  addMessage: (id: string, msg: { kind: "text"; text: string; author?: string }) => void;
}) {
  const [imagePreview, setImagePreview] = React.useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <DetailPanel
        open={open}
        onOpenChange={onOpenChange}
        title={complaint ? formatReportNumber(complaint.id) : "Complaint"}
        description={
          complaint
            ? `${formatReportNumber(complaint.id)} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${
                complaint.facilityId ? getFacilityName(complaint.facilityId) : "Unknown company"
              } ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${new Date(complaint.createdAt).toLocaleString()}`
            : undefined
        }
      >
        {complaint ? (
          <ComplaintDrawerBody
            complaint={complaint}
            currentUserLabel={currentUserLabel}
            reportAssignees={reportAssignees}
            addRecord={addRecord}
            onSwitchToRecords={onSwitchToRecords}
            onRequestDeleteComplaint={onRequestDeleteComplaint}
            onPreviewImage={(src, alt) => setImagePreview({ src, alt })}
            setSubject={setSubject}
            setCategory={setCategory}
            assignTo={assignTo}
            toggleFlag={toggleFlag}
            setStatus={setStatus}
            addMessage={addMessage}
          />
        ) : null}
      </DetailPanel>

      <Dialog open={Boolean(imagePreview)} onOpenChange={(o) => (!o ? setImagePreview(null) : null)}>
        <DialogContent className="max-w-[min(920px,calc(100%-2rem))] p-3">
          {imagePreview ? (
            <img
              src={imagePreview.src}
              alt={imagePreview.alt}
              className="max-h-[80svh] w-full rounded-md bg-muted/30 object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}


