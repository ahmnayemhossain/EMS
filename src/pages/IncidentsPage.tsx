import * as React from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Flag,
  FlagOff,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";

import { facilities, getFacilityName, incidents } from "@/data/mock";
import { reportAssignees } from "@/data/report-box";
import { useSelectedFactory } from "@/app/state/factory";
import { useReportBox } from "@/app/state/report-box";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
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
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { DetailPanel } from "@/components/DetailPanel";
import { EmptyState } from "@/components/EmptyState";
import { VoiceMessage } from "@/components/VoiceMessage";
import { formatDate } from "@/utils/format";
import { cn } from "@/app/components/ui/utils";
import type { Incident, ReportBoxReport, ReportBoxAttachment } from "@/types/ems";

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

export function IncidentsPage() {
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

  const [tab, setTab] = React.useState<
    "incidents" | "complaints" | "complaint-trend"
  >("incidents");

  const [search, setSearch] = React.useState("");
  const [factoryId, setFactoryId] = React.useState<string | undefined>();

  const [incidentRows, setIncidentRows] = React.useState<Incident[]>(() => incidents);
  const [incidentCreateOpen, setIncidentCreateOpen] = React.useState(false);
  const [incidentDraft, setIncidentDraft] = React.useState<{
    facilityId?: string;
    date: string;
    title: string;
    type: Incident["type"];
    severity: Incident["severity"];
  }>(() => ({
    facilityId: facilities[0]?.id,
    date: new Date().toISOString().slice(0, 10),
    title: "",
    type: "near_miss",
    severity: "low",
  }));

  const [complaintSearch, setComplaintSearch] = React.useState("");
  const [complaintFactoryId, setComplaintFactoryId] = React.useState<string | undefined>();
  const [complaintStatus, setComplaintStatus] = React.useState<ReportBoxReport["status"] | "all">("all");
  const [showFlaggedOnly, setShowFlaggedOnly] = React.useState(false);
  const [selectedComplaint, setSelectedComplaint] = React.useState<ReportBoxReport | null>(null);
  const [complaintDrawerOpen, setComplaintDrawerOpen] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [refreshingInbox, setRefreshingInbox] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<{ src: string; alt: string } | null>(null);

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

  const incidentRowsFiltered = incidentRows
    .filter((i) => (factoryId ? i.facilityId === factoryId : true))
    .filter((i) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q);
    });

  const incidentCols: Array<DataColumn<Incident>> = [
    {
      id: "incident",
      header: "Incident",
      cell: (i) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{i.title}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {getFacilityName(i.facilityId)} • {formatDate(i.date)}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (i) => <StatusBadge tone="info">{i.type.replace(/_/g, " ")}</StatusBadge>,
      className: "whitespace-nowrap",
    },
    {
      id: "severity",
      header: "Severity",
      cell: (i) => (
        <StatusBadge tone={i.severity === "high" ? "critical" : i.severity === "medium" ? "warning" : "neutral"}>
          {i.severity}
        </StatusBadge>
      ),
      className: "whitespace-nowrap",
    },
    {
      id: "status",
      header: "Status",
      cell: (i) => (
        <StatusBadge tone={i.status === "closed" ? "compliant" : i.status === "investigating" ? "warning" : "info"}>
          {i.status}
        </StatusBadge>
      ),
      className: "whitespace-nowrap",
    },
    {
      id: "action",
      header: "",
      cell: () => (
        <div className="text-right">
          <Button size="sm" variant="outline">
            Open
          </Button>
        </div>
      ),
      className: "text-right whitespace-nowrap",
    },
  ];

  const publicUrl = React.useMemo(() => getPublicReportBoxUrl(selectedFactoryId), [selectedFactoryId]);

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

  const flaggedCount = React.useMemo(() => reports.filter((r) => r.flagged).length, [reports]);

  React.useEffect(() => {
    if (!selectedComplaint) return;
    const latest = reports.find((r) => r.id === selectedComplaint.id) || null;
    setSelectedComplaint(latest);
  }, [reports, selectedComplaint?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="complaints">Complaint box</TabsTrigger>
          <TabsTrigger value="complaint-trend">Complaint trend</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          {tab === "incidents" ? (
            <Button variant="outline" onClick={() => setIncidentCreateOpen(true)}>
              <TriangleAlert className="mr-2 size-4" />
              Create
            </Button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      <TabsContent value="incidents">
        <FilterBar
          left={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-[320px]">
                <SearchInput value={search} onChange={setSearch} placeholder="Search incidents..." />
              </div>
              <SelectFilter
                value={factoryId}
                onChange={setFactoryId}
                placeholder="Factory"
                items={facilities.map((f) => ({ value: f.id, label: f.name }))}
              />
              <DateRangePickerPlaceholder label="Date" />
            </div>
          }
          onClear={() => {
            setSearch("");
            setFactoryId(undefined);
          }}
        />

        <DataTable rows={incidentRowsFiltered} columns={incidentCols} rowKey={(r) => r.id} />
      </TabsContent>

      <TabsContent value="complaints">
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
                <SearchInput value={complaintSearch} onChange={setComplaintSearch} placeholder="Search complaints..." />
              </div>
              <SelectFilter
                value={complaintFactoryId}
                onChange={setComplaintFactoryId}
                placeholder="Factory"
                items={facilities.map((f) => ({ value: f.id, label: f.name }))}
              />
              <SelectFilter
                value={complaintStatus === "all" ? undefined : complaintStatus}
                onChange={(v) => setComplaintStatus((v as any) || "all")}
                placeholder="Status"
                items={[
                  { value: "new", label: "new" },
                  { value: "triaged", label: "triaged" },
                  { value: "handled", label: "handled" },
                ]}
              />
            </div>
          }
          onClear={() => {
            setComplaintSearch("");
            setComplaintFactoryId(undefined);
            setComplaintStatus("all");
            setShowFlaggedOnly(false);
          }}
        />

        {complaintRows.length ? (
          <div className="space-y-3">
            {complaintRows.map((r) => (
              <div
                key={r.id}
                className={[
                  "relative cursor-pointer rounded-xl border p-3 pl-4 pr-12 transition-colors hover:bg-muted/20",
                  r.flagged ? "border-[var(--critical-100)] bg-[var(--critical-50)]" : "",
                  !r.flagged && r.status === "new" ? "border-[var(--success-100)] bg-[var(--success-50)]" : "",
                ].join(" ")}
                onClick={() => {
                  setSelectedComplaint(r);
                  setComplaintDrawerOpen(true);
                  if (r.status === "new") setStatus(r.id, "triaged");
                }}
              >
                {r.status === "new" ? <span className="absolute inset-y-2 left-2 w-1 rounded-full bg-[var(--success-600)]" /> : null}
                {r.flagged ? <span className="absolute inset-y-2 left-[0.65rem] w-1 rounded-full bg-[var(--critical-600)]" /> : null}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{r.subject}</div>
                      {r.status === "new" ? <StatusBadge tone="compliant">new</StatusBadge> : null}
                    </div>
                    <div className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                        {r.messages[0]?.text ||
                          (r.messages[0]?.kind === "voice" ? "Voice complaint" : r.messages[0]?.kind === "photo" ? "Photo complaint" : "")}
                      </div>
                    <div className="text-muted-foreground mt-2 text-xs">
                      <span className="font-mono">{formatReportNumber(r.id)}</span> •{" "}
                      {r.facilityId ? getFacilityName(r.facilityId) : "Unknown factory"} •{" "}
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={r.flagged ? "Unflag" : "Flag"}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlag(r.id);
                        if (r.status === "new") setStatus(r.id, "triaged");
                      }}
                      className={
                        r.flagged
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          : r.status === "handled"
                            ? "text-[var(--success-700)]"
                            : "text-muted-foreground"
                      }
                    >
                      {r.flagged ? <Flag className="size-4 fill-current" /> : r.status === "handled" ? <CheckCircle2 className="size-4" /> : <Flag className="size-4" />}
                    </Button>
                    <StatusBadge tone={r.status === "handled" ? "compliant" : r.status === "triaged" ? "warning" : "info"}>{r.status}</StatusBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No complaints yet"
            description="Incoming complaints will appear here from the public URL (or from local inbox files in public/report-box/inbox/)."
            action={
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
                Copy URL
              </Button>
            }
          />
        )}
      </TabsContent>

      <TabsContent value="complaint-trend" className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-3">
            <div className="text-muted-foreground text-xs">Total complaints</div>
            <div className="mt-1 text-2xl font-semibold">{reports.length}</div>
            <div className="text-muted-foreground mt-2 text-xs">
              New: {reports.filter((r) => r.status === "new").length} • Triaged: {reports.filter((r) => r.status === "triaged").length} • Handled: {reports.filter((r) => r.status === "handled").length}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-muted-foreground text-xs">Flagged</div>
            <div className="mt-1 text-2xl font-semibold">{flaggedCount}</div>
            <div className="text-muted-foreground mt-2 text-xs">Flagged items need supervisor attention.</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-muted-foreground text-xs">Top categories</div>
            <div className="mt-3 space-y-2">
              {complaintCategories
                .map((c) => ({
                  ...c,
                  count: reports.filter((r) => (r.category || "other") === c.value).length,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((c) => (
                  <div key={c.value} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0 truncate">{c.label}</div>
                    <div className="text-muted-foreground tabular-nums">{c.count}</div>
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
            ? `${formatReportNumber(selectedComplaint.id)} • ${selectedComplaint.facilityId ? getFacilityName(selectedComplaint.facilityId) : "Unknown factory"} • ${new Date(selectedComplaint.createdAt).toLocaleString()}`
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
              <StatusBadge tone={selectedComplaint.status === "handled" ? "compliant" : selectedComplaint.status === "triaged" ? "warning" : "info"}>
                {selectedComplaint.status}
              </StatusBadge>
              {selectedComplaint.flagged ? <StatusBadge tone="critical">flagged</StatusBadge> : null}
              {selectedComplaint.category ? (
                <StatusBadge tone="neutral">
                  {complaintCategories.find((c) => c.value === selectedComplaint.category)?.label || selectedComplaint.category}
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
              <Select value={selectedComplaint.assignedTo || ""} onValueChange={(v) => assignTo(selectedComplaint.id, v || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {reportAssignees.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={selectedComplaint.flagged ? "destructive" : "outline"} onClick={() => toggleFlag(selectedComplaint.id)}>
                {selectedComplaint.flagged ? <FlagOff className="mr-2 size-4" /> : <Flag className="mr-2 size-4" />}
                {selectedComplaint.flagged ? "Unflag" : "Flag"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(selectedComplaint.id, selectedComplaint.status === "handled" ? "triaged" : "handled")}>
                <CheckCircle2 className="mr-2 size-4" />
                {selectedComplaint.status === "handled" ? "Reopen" : "Mark handled"}
              </Button>
              <Select value={selectedComplaint.status} onValueChange={(v) => setStatus(selectedComplaint.id, v as ReportBoxReport["status"])}>
                <SelectTrigger className="h-8 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">new</SelectItem>
                  <SelectItem value="triaged">triaged</SelectItem>
                  <SelectItem value="handled">handled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-xs">Conversation</div>
              <div className="rounded-xl border bg-muted/10 p-3">
                <div className="space-y-2">
                  {selectedComplaint.messages.map((m) => {
                    const isEmsNote = m.kind === "text" && (m.text || "").toLowerCase().startsWith("ems note:");
                    const align = isEmsNote ? "justify-start" : "justify-end";
                    const bubble =
                      isEmsNote
                        ? "bg-card border-border"
                        : "bg-primary/10 border-primary/20";
                    const displayText = isEmsNote ? stripEmsNotePrefix(m.text) : (m.text || "");

                    return (
                      <div key={m.id} className={cn("flex", align)}>
                        <div className={cn("max-w-[88%] rounded-2xl border px-3 py-2 shadow-sm", bubble)}>
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
              <Textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Write a short note..." className="min-h-20" />
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setNoteDraft("")} disabled={!noteDraft.trim()}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!noteDraft.trim()) return;
                    addMessage(selectedComplaint.id, { kind: "text", text: `EMS note: ${noteDraft.trim()}` });
                    setNoteDraft("");
                  }}
                  disabled={!noteDraft.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </div>

          </div>
        ) : null}
      </DetailPanel>

      <Dialog open={incidentCreateOpen} onOpenChange={setIncidentCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create incident</DialogTitle>
            <DialogDescription>Log an environmental / safety incident.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">Factory</div>
              <Select value={incidentDraft.facilityId || ""} onValueChange={(v) => setIncidentDraft((d) => ({ ...d, facilityId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select factory" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">Date</div>
              <Input type="date" value={incidentDraft.date} onChange={(e) => setIncidentDraft((d) => ({ ...d, date: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-muted-foreground text-xs">Type</div>
                <Select value={incidentDraft.type} onValueChange={(v) => setIncidentDraft((d) => ({ ...d, type: v as Incident["type"] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spill">spill</SelectItem>
                    <SelectItem value="chemical_exposure">chemical exposure</SelectItem>
                    <SelectItem value="wastewater_exceedance">wastewater exceedance</SelectItem>
                    <SelectItem value="fire">fire</SelectItem>
                    <SelectItem value="near_miss">near miss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="text-muted-foreground text-xs">Severity</div>
                <Select value={incidentDraft.severity} onValueChange={(v) => setIncidentDraft((d) => ({ ...d, severity: v as Incident["severity"] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">Title</div>
              <Input value={incidentDraft.title} onChange={(e) => setIncidentDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Write a short incident title..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!incidentDraft.facilityId || !incidentDraft.date || !incidentDraft.title.trim()) return;
                setIncidentRows((prev) => [
                  {
                    id: `inc_local_${Date.now()}`,
                    facilityId: incidentDraft.facilityId,
                    date: incidentDraft.date,
                    title: incidentDraft.title.trim(),
                    type: incidentDraft.type,
                    severity: incidentDraft.severity,
                    status: "open",
                  },
                  ...prev,
                ]);
                setIncidentDraft((d) => ({ ...d, title: "" }));
                setIncidentCreateOpen(false);
              }}
              disabled={!incidentDraft.facilityId || !incidentDraft.date || !incidentDraft.title.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
