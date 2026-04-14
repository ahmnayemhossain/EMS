import * as React from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Flag,
  FlagOff,
  RefreshCw,
} from "lucide-react";

import { facilities, getFacilityName } from "@/data/mock";
import { reportAssignees } from "@/data/report-box";
import { useSelectedFactory } from "@/app/state/factory";
import { useReportBox } from "@/app/state/report-box";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { DetailPanel } from "@/components/DetailPanel";
import { EmptyState } from "@/components/EmptyState";
import { VoiceMessage } from "@/components/VoiceMessage";
import { cn } from "@/app/components/ui/utils";
import type { ReportBoxAttachment, ReportBoxReport } from "@/types/ems";
import {
  Dialog,
  DialogContent,
} from "@/app/components/ui/dialog";

function getPublicReportBoxUrl(selectedFactoryId: string) {
  if (typeof window === "undefined") return "";
  const { origin, pathname, hash } = window.location;
  const factoryCode =
    facilities.find((f) => f.id === selectedFactoryId)?.code?.toLowerCase() ||
    "hfl";
  const base = hash.startsWith("#/")
    ? `${origin}${pathname}#/rb/${factoryCode}`
    : `${origin}/rb/${factoryCode}`;
  return base;
}

function formatReportNumber(reportId: string) {
  const yy = String(new Date().getFullYear() % 100).padStart(2, "0");
  const digits = reportId.replace(/\D/g, "");
  const tail = (digits.slice(-3) || "0").padStart(3, "0");
  return `${yy}/${tail}`;
}

function getAttachmentSrc(att?: ReportBoxAttachment) {
  return att?.dataUrl || att?.url || "";
}

function stripEmsNotePrefix(text?: string) {
  if (!text) return "";
  return text.replace(/^EMS note:\s*/i, "").trim();
}

export function ComplaintBoxPage() {
  const { selectedFactoryId } = useSelectedFactory();
  const {
    reports,
    toggleFlag,
    setStatus,
    setCategory,
    assignTo,
    addMessage,
    deleteReport,
    refreshFromInbox,
  } = useReportBox();

  const [tab, setTab] = React.useState<"complaints" | "complaint-trend">(
    "complaints",
  );

  const [complaintSearch, setComplaintSearch] = React.useState("");
  const [complaintFactoryId, setComplaintFactoryId] = React.useState<
    string | undefined
  >();
  const [complaintStatus, setComplaintStatus] = React.useState<
    ReportBoxReport["status"] | "all"
  >("all");
  const [showFlaggedOnly, setShowFlaggedOnly] = React.useState(false);
  const [selectedComplaint, setSelectedComplaint] =
    React.useState<ReportBoxReport | null>(null);
  const [complaintDrawerOpen, setComplaintDrawerOpen] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [refreshingInbox, setRefreshingInbox] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<{
    src: string;
    alt: string;
  } | null>(null);

  const complaintCategories = React.useMemo(
    () => [
      { value: "harassment", label: "Harassment" },
      { value: "abuse", label: "Gali / Abuse" },
      { value: "safety", label: "Safety" },
      { value: "environment", label: "Environment" },
      { value: "quality", label: "Quality" },
      { value: "wage", label: "Wage / Overtime" },
      { value: "other", label: "Other" },
    ],
    [],
  );

  const publicUrl = React.useMemo(
    () => getPublicReportBoxUrl(selectedFactoryId),
    [selectedFactoryId],
  );

  const complaintRows = reports
    .filter((r) => (complaintFactoryId ? r.facilityId === complaintFactoryId : true))
    .filter((r) => (complaintStatus === "all" ? true : r.status === complaintStatus))
    .filter((r) => (showFlaggedOnly ? r.flagged : true))
    .filter((r) => {
      const q = complaintSearch.trim().toLowerCase();
      if (!q) return true;
      const body = r.messages.map((m) => m.text || "").join(" ").toLowerCase();
      return (
        r.subject.toLowerCase().includes(q) ||
        body.includes(q) ||
        (r.assignedTo || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const flaggedCount = React.useMemo(
    () => reports.filter((r) => r.flagged).length,
    [reports],
  );

  React.useEffect(() => {
    if (!selectedComplaint) return;
    const latest = reports.find((r) => r.id === selectedComplaint.id) || null;
    setSelectedComplaint(latest);
  }, [reports, selectedComplaint?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const trendSeries = React.useMemo(() => {
    // very small placeholder trend: group by day (last 14)
    const days: Array<{ date: string; count: number }> = [];
    const start = new Date();
    start.setDate(start.getDate() - 13);
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: 0 });
    }
    for (const r of reports) {
      const key = new Date(r.createdAt).toISOString().slice(0, 10);
      const hit = days.find((x) => x.date === key);
      if (hit) hit.count += 1;
    }
    return days;
  }, [reports]);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="complaints">Complaint box</TabsTrigger>
          <TabsTrigger value="complaint-trend">Complaint trend</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <Button
            variant={showFlaggedOnly ? "destructive" : "outline"}
            onClick={() => setShowFlaggedOnly((v) => !v)}
          >
            <Flag className={showFlaggedOnly ? "mr-2 size-4 fill-current" : "mr-2 size-4"} />
            Flagged ({flaggedCount})
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setRefreshingInbox(true);
              try {
                await refreshFromInbox();
              } finally {
                setRefreshingInbox(false);
              }
            }}
            disabled={refreshingInbox}
          >
            <RefreshCw className={refreshingInbox ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />
            Refresh
          </Button>
        </div>
      </div>

      <TabsContent value="complaints" className="space-y-4">
        <div className="rounded-xl border bg-card p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{publicUrl || "--"}</div>
              <div className="text-muted-foreground mt-1 text-xs">
                Scan / open {"->"} submit complaint (text / voice / photo). Factory is taken from header selection.
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicUrl);
                  } catch {
                    // ignore
                  }
                }}
                disabled={!publicUrl}
              >
                <Copy className="mr-2 size-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}
                disabled={!publicUrl}
              >
                <ExternalLink className="mr-2 size-4" />
                Open
              </Button>
            </div>
          </div>
        </div>

        <FilterBar
          left={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-[320px]">
                <SearchInput
                  value={complaintSearch}
                  onChange={setComplaintSearch}
                  placeholder="Search complaints..."
                />
              </div>
              <SelectFilter
                value={complaintFactoryId}
                onChange={setComplaintFactoryId}
                placeholder="Factory"
                items={facilities.map((f) => ({ value: f.id, label: f.name }))}
              />
              <Select
                value={complaintStatus}
                onValueChange={(v) => setComplaintStatus(v as any)}
              >
                <SelectTrigger className="h-10 w-full sm:w-[170px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">new</SelectItem>
                  <SelectItem value="triaged">triaged</SelectItem>
                  <SelectItem value="handled">handled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          onClear={() => {
            setComplaintSearch("");
            setComplaintFactoryId(undefined);
            setComplaintStatus("all");
          }}
        />

        {complaintRows.length ? (
          <div className="grid gap-3">
            {complaintRows.map((r) => (
              <button
                key={r.id}
                type="button"
                className={cn(
                  "rounded-xl border bg-card p-3 text-left shadow-xs transition hover:bg-muted/20",
                  r.flagged && "border-destructive/30 bg-destructive/5",
                )}
                onClick={() => {
                  setSelectedComplaint(r);
                  setComplaintDrawerOpen(true);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {formatReportNumber(r.id)}{" "}
                      <span className="text-muted-foreground font-normal">•</span>{" "}
                      {r.facilityId ? getFacilityName(r.facilityId) : "Unknown factory"}
                    </div>
                    <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {r.subject}
                    </div>
                  </div>
                  <div className="shrink-0 space-y-1 text-right">
                    <StatusBadge
                      tone={
                        r.status === "handled"
                          ? "compliant"
                          : r.status === "triaged"
                            ? "warning"
                            : "info"
                      }
                    >
                      {r.status}
                    </StatusBadge>
                    {r.flagged ? <StatusBadge tone="critical">flagged</StatusBadge> : null}
                  </div>
                </div>
                <div className="text-muted-foreground mt-2 flex items-center justify-between gap-3 text-[11px]">
                  <div className="truncate">
                    {r.assignedTo ? `Supervisor: ${r.assignedTo}` : "Unassigned"}
                  </div>
                  <div className="tabular-nums">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No complaints"
            description="Complaints will appear here after workers submit from the public URL."
          />
        )}
      </TabsContent>

      <TabsContent value="complaint-trend" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-3">
            <div className="text-sm font-semibold">Inbox status</div>
            <div className="text-muted-foreground mt-2 text-sm">
              Total complaints: <span className="font-medium">{reports.length}</span>
            </div>
            <div className="text-muted-foreground mt-1 text-sm">
              Flagged: <span className="font-medium">{flaggedCount}</span>
            </div>
            <div className="text-muted-foreground mt-2 text-xs">
              Trend is a placeholder; you can wire real analytics later.
            </div>
          </div>
          <div className="rounded-xl border bg-card p-3 lg:col-span-2">
            <div className="text-sm font-semibold">Last 14 days</div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {trendSeries.map((d) => (
                <div key={d.date} className="rounded-lg border bg-muted/10 p-2">
                  <div className="text-muted-foreground text-[10px]">{d.date.slice(5)}</div>
                  <div className="mt-1 text-sm font-semibold tabular-nums">{d.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-3 lg:col-span-3">
            <div className="text-sm font-semibold">Top categories</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {complaintCategories
                .map((c) => ({
                  ...c,
                  count: reports.filter((r) => (r.category || "other") === c.value).length,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((c) => (
                  <div key={c.value} className="rounded-lg border bg-muted/10 p-3">
                    <div className="text-muted-foreground text-xs">{c.label}</div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">{c.count}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <DetailPanel
        open={complaintDrawerOpen}
        onOpenChange={(o) => {
          setComplaintDrawerOpen(o);
          if (!o) setSelectedComplaint(null);
          if (!o) setConfirmDelete(false);
        }}
        title={selectedComplaint ? selectedComplaint.subject : "Complaint"}
        description={
          selectedComplaint
            ? `${formatReportNumber(selectedComplaint.id)} • ${
                selectedComplaint.facilityId
                  ? getFacilityName(selectedComplaint.facilityId)
                  : "Unknown factory"
              } • ${new Date(selectedComplaint.createdAt).toLocaleString()}`
            : undefined
        }
        overlay={
          confirmDelete && selectedComplaint ? (
            <div
              className="absolute inset-0 z-[60] flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm"
              onPointerDown={() => setConfirmDelete(false)}
              role="presentation"
            >
              <div
                className="w-full max-w-sm rounded-xl border border-destructive/40 bg-card p-4 shadow-lg"
                onPointerDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Confirm delete complaint"
              >
                <div className="text-destructive text-sm font-semibold">Delete this complaint?</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  This removes it from the local inbox files and UI.
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      void deleteReport(selectedComplaint.id);
                      setConfirmDelete(false);
                      setComplaintDrawerOpen(false);
                      setSelectedComplaint(null);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : null
        }
      >
        {selectedComplaint ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge
                tone={
                  selectedComplaint.status === "handled"
                    ? "compliant"
                    : selectedComplaint.status === "triaged"
                      ? "warning"
                      : "info"
                }
              >
                {selectedComplaint.status}
              </StatusBadge>
              {selectedComplaint.flagged ? (
                <StatusBadge tone="critical">flagged</StatusBadge>
              ) : null}
              {selectedComplaint.category ? (
                <StatusBadge tone="neutral">
                  {complaintCategories.find((c) => c.value === selectedComplaint.category)?.label ||
                    selectedComplaint.category}
                </StatusBadge>
              ) : null}
            </div>

            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">Category</div>
              <Select
                value={selectedComplaint.category || ""}
                onValueChange={(v) => setCategory(selectedComplaint.id, v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {complaintCategories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">Supervisor</div>
              <Select
                value={selectedComplaint.assignedTo || ""}
                onValueChange={(v) => assignTo(selectedComplaint.id, v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {reportAssignees.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={selectedComplaint.flagged ? "destructive" : "outline"}
                onClick={() => toggleFlag(selectedComplaint.id)}
              >
                {selectedComplaint.flagged ? (
                  <FlagOff className="mr-2 size-4" />
                ) : (
                  <Flag className="mr-2 size-4" />
                )}
                {selectedComplaint.flagged ? "Unflag" : "Flag"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setStatus(
                    selectedComplaint.id,
                    selectedComplaint.status === "handled" ? "triaged" : "handled",
                  )
                }
              >
                <CheckCircle2 className="mr-2 size-4" />
                {selectedComplaint.status === "handled" ? "Reopen" : "Mark handled"}
              </Button>
              <Select
                value={selectedComplaint.status}
                onValueChange={(v) =>
                  setStatus(selectedComplaint.id, v as ReportBoxReport["status"])
                }
              >
                <SelectTrigger className="h-8 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">new</SelectItem>
                  <SelectItem value="triaged">triaged</SelectItem>
                  <SelectItem value="handled">handled</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-xs">Conversation</div>
              <div className="rounded-xl border bg-muted/10 p-3">
                <div className="space-y-2">
                  {selectedComplaint.messages.map((m) => {
                    const isEmsNote =
                      m.kind === "text" &&
                      (m.text || "").toLowerCase().startsWith("ems note:");
                    const align = isEmsNote ? "justify-start" : "justify-end";
                    const bubble = isEmsNote
                      ? "bg-card border-border"
                      : "bg-primary/10 border-primary/20";
                    const displayText = isEmsNote
                      ? stripEmsNotePrefix(m.text)
                      : m.text || "";

                    return (
                      <div key={m.id} className={cn("flex", align)}>
                        <div
                          className={cn(
                            "max-w-[88%] rounded-2xl border px-3 py-2 shadow-sm",
                            bubble,
                          )}
                        >
                          <div className="text-muted-foreground/40 mb-0.5 text-[8px] tabular-nums">
                            {new Date(m.at).toLocaleString()}
                          </div>

                          {m.kind === "text" && displayText ? (
                            <div className="text-sm leading-relaxed">{displayText}</div>
                          ) : null}

                          {m.kind === "photo" && getAttachmentSrc(m.attachment) ? (
                            <button
                              type="button"
                              className="mt-2 block w-full cursor-zoom-in"
                              onClick={() =>
                                setImagePreview({
                                  src: getAttachmentSrc(m.attachment),
                                  alt: m.attachment?.name || "photo",
                                })
                              }
                              aria-label="Preview image"
                            >
                              <img
                                src={getAttachmentSrc(m.attachment)}
                                alt={m.attachment?.name || "photo"}
                                className="max-h-64 w-full rounded-xl bg-muted/30 object-contain"
                              />
                            </button>
                          ) : null}

                          {m.kind === "voice" && getAttachmentSrc(m.attachment) ? (
                            <div className="mt-2">
                              <VoiceMessage
                                src={getAttachmentSrc(m.attachment)}
                                durationSec={m.durationSec}
                                density="compact"
                                variant="whatsapp"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-xs">Add note</div>
              <Textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Write a short note..."
                className="min-h-20"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNoteDraft("")}
                  disabled={!noteDraft.trim()}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!noteDraft.trim()) return;
                    addMessage(selectedComplaint.id, {
                      kind: "text",
                      text: `EMS note: ${noteDraft.trim()}`,
                    });
                    setNoteDraft("");
                  }}
                  disabled={!noteDraft.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
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
    </Tabs>
  );
}

