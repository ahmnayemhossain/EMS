import * as React from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Flag,
  FlagOff,
  Printer,
  RefreshCw,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

import { facilities, getFacilityName } from "@/data/mock";
import { reportAssignees } from "@/data/report-box";
import { useSelectedFactory } from "@/app/state/factory";
import { useReportBox } from "@/app/state/report-box";
import { useCurrentUser } from "@/app/state/user";
import { formatUserLabel } from "@/data/users";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
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
import { ActionModal } from "@/components/ActionModal";
import { AvatarStack } from "@/components/AvatarStack";
import { VoiceMessage } from "@/components/VoiceMessage";
import { cn } from "@/app/components/ui/utils";
import type { ReportBoxAttachment, ReportBoxRecord, ReportBoxReport } from "@/types/ems";
import {
  Dialog,
  DialogContent,
} from "@/app/components/ui/dialog";
import {
  formatReportNumber,
  getAttachmentSrc,
  getPublicReportBoxUrl,
  getWorkingUsersForComplaint,
  stripEmsNotePrefix,
} from "@/pages/ComplaintBoxPage/utils";

export function ComplaintBoxPage() {
  const { selectedFactoryId } = useSelectedFactory();
  const currentUser = useCurrentUser();
  const currentUserLabel = currentUser ? formatUserLabel(currentUser) : "User";
  const {
    reports,
    records,
    setSubject,
    addRecord,
    removeRecord,
    toggleFlag,
    setStatus,
    setCategory,
    assignTo,
    addMessage,
    deleteReport,
    refreshFromInbox,
  } = useReportBox();

  const [tab, setTab] = React.useState<"complaints" | "complaint-trend" | "records">(
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
  const [titleDraft, setTitleDraft] = React.useState("");
  const [categoryDraft, setCategoryDraft] = React.useState<string>("");
  const [assigneeDraft, setAssigneeDraft] = React.useState<string>("");
  const [statusDraft, setStatusDraft] =
    React.useState<ReportBoxReport["status"]>("new");
  const [flaggedDraft, setFlaggedDraft] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [pendingNotes, setPendingNotes] = React.useState<
    Array<{ id: string; at: string; text: string; author: string }>
  >([]);
  const [refreshingInbox, setRefreshingInbox] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [recordSearch, setRecordSearch] = React.useState("");
  const [showValidation, setShowValidation] = React.useState(false);
  const [action, setAction] = React.useState<
    | { kind: "delete-complaint"; report: ReportBoxReport }
    | { kind: "remove-record"; record: ReportBoxRecord }
    | null
  >(null);

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

  React.useEffect(() => {
    if (!selectedComplaint) return;
    setTitleDraft(selectedComplaint.subject || "");
    setCategoryDraft(selectedComplaint.category || "");
    setAssigneeDraft(selectedComplaint.assignedTo || "");
    setStatusDraft(selectedComplaint.status);
    setFlaggedDraft(Boolean(selectedComplaint.flagged));
    setPendingNotes([]);
    setNoteDraft("");
    setShowValidation(false);
  }, [selectedComplaint?.id]);

  const noteInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const lastSavedRef = React.useRef<string | null>(null);

  function createLocalId(prefix: string) {
    const rand = Math.random().toString(16).slice(2);
    return `${prefix}_${Date.now().toString(16)}_${rand}`;
  }

  function hasEmsNote(r: ReportBoxReport) {
    return r.messages.some(
      (m) =>
        m.kind === "text" &&
        (m.text || "").toLowerCase().startsWith("ems note:") &&
        stripEmsNotePrefix(m.text).trim().length > 0,
    );
  }

  const drawerDirty = Boolean(
    selectedComplaint &&
      (titleDraft.trim() !== (selectedComplaint.subject || "").trim() ||
        categoryDraft !== (selectedComplaint.category || "") ||
        assigneeDraft !== (selectedComplaint.assignedTo || "") ||
        statusDraft !== selectedComplaint.status ||
        flaggedDraft !== Boolean(selectedComplaint.flagged) ||
        pendingNotes.length > 0 ||
        noteDraft.trim().length > 0),
  );

  function validateDrawer() {
    if (!selectedComplaint) return "No complaint selected.";
    if (!titleDraft.trim()) return "Title is required.";
    if (!categoryDraft) return "Category is required.";
    if (!assigneeDraft) return "Supervisor assignment is required.";
    const noteWillExist =
      hasEmsNote(selectedComplaint) ||
      pendingNotes.length > 0 ||
      noteDraft.trim().length > 0;
    if (!noteWillExist) return "Note is required.";
    return null;
  }

  async function saveDrawer() {
    if (!selectedComplaint) return;
    setShowValidation(true);
    const err = validateDrawer();
    if (err) {
      toast.error(err);
      if (err.toLowerCase().includes("note")) noteInputRef.current?.focus();
      return;
    }

    // Commit main fields
    const nextTitle = titleDraft.trim();
    if (nextTitle !== selectedComplaint.subject) setSubject(selectedComplaint.id, nextTitle);
    if ((categoryDraft || undefined) !== selectedComplaint.category) {
      setCategory(selectedComplaint.id, categoryDraft || undefined);
    }
    if ((assigneeDraft || undefined) !== selectedComplaint.assignedTo) {
      assignTo(selectedComplaint.id, assigneeDraft || undefined);
    }
    if (flaggedDraft !== Boolean(selectedComplaint.flagged)) {
      toggleFlag(selectedComplaint.id);
    }

    // Notes: pending list + inline draft (if any)
    const inline = noteDraft.trim();
    const toAdd = [
      ...pendingNotes,
      ...(inline
        ? [
            {
              id: createLocalId("pn"),
              at: new Date().toISOString(),
              text: inline,
              author: currentUserLabel,
            },
          ]
        : []),
    ];

    for (const n of toAdd) {
      addMessage(selectedComplaint.id, {
        kind: "text",
        text: `EMS note: ${n.text}`,
        author: n.author,
      });
    }
    setPendingNotes([]);
    setNoteDraft("");

    // Status (handler set only when handled)
    if (statusDraft !== selectedComplaint.status) {
      setStatus(
        selectedComplaint.id,
        statusDraft,
        statusDraft === "handled" ? { handledBy: currentUserLabel } : undefined,
      );
    } else if (statusDraft === "handled" && !selectedComplaint.handledBy) {
      setStatus(selectedComplaint.id, "handled", { handledBy: currentUserLabel });
    }

    lastSavedRef.current = new Date().toISOString();
    toast.success("Saved");
  }

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

  const filteredRecords = React.useMemo(() => {
    const q = recordSearch.trim().toLowerCase();
    return records
      .filter((r) => {
        if (!q) return true;
        const hay = [
          r.title,
          formatReportNumber(r.reportId),
          r.snapshot.subject,
          r.snapshot.assignedTo || "",
          r.snapshot.category || "",
          r.snapshot.facilityId ? getFacilityName(r.snapshot.facilityId) : "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1));
  }, [records, recordSearch]);

  function getRecordFactoryName(r: ReportBoxRecord) {
    const fid = r.snapshot.facilityId;
    return fid ? getFacilityName(fid) : "Unknown factory";
  }

  function buildRecordHtml(r: ReportBoxRecord) {
    const report = r.snapshot;
    const title = report.subject?.trim() || formatReportNumber(report.id);
    const factoryName = report.facilityId ? getFacilityName(report.facilityId) : "Unknown factory";
    const createdAt = new Date(report.createdAt).toLocaleString();
    const recordedAt = new Date(r.recordedAt).toLocaleString();

    const messagesHtml = report.messages
      .map((m) => {
        const at = new Date(m.at).toLocaleString();
        const isNote =
          m.kind === "text" && (m.text || "").toLowerCase().startsWith("ems note:");
        const text = isNote ? stripEmsNotePrefix(m.text) : m.text || "";
        const author = (m.author || "").trim();
        const safeAuthor = author
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const meta = isNote
          ? `<b>NOTE</b> \u00B7 ${at}${safeAuthor ? ` \u00B7 ${safeAuthor}` : ""}`
          : `${at}`;
        const safeText = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const media =
          m.kind === "photo" && getAttachmentSrc(m.attachment)
            ? `<img src="${getAttachmentSrc(m.attachment)}" alt="photo" style="max-width:100%;border-radius:12px;margin-top:8px;background:rgba(148,163,184,.12);" />`
            : m.kind === "voice" && getAttachmentSrc(m.attachment)
              ? `<audio controls src="${getAttachmentSrc(m.attachment)}" style="width:100%;margin-top:8px;"></audio>`
              : "";

        return `
          <div style="margin:12px 0;padding:12px;border-radius:16px;border:1px ${isNote ? "dashed" : "solid"} ${isNote ? "rgba(148,163,184,.55)" : "rgba(34,197,94,.25)"};background:${isNote ? "rgba(148,163,184,.08)" : "rgba(34,197,94,.08)"};">
            <div style="font-size:11px;color:rgba(100,116,139,.95);margin-bottom:6px;">${isNote ? "<b>NOTE</b> \u00B7 " : ""}${at}</div>
            ${safeText ? `<div style="font-size:14px;line-height:1.5;white-space:pre-wrap;">${safeText}</div>` : ""}
            ${media}
          </div>
        `;
      })
      .join("");

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue"; margin: 0; background: #f8fafc; color:#0f172a; }
      .wrap { max-width: 920px; margin: 24px auto; padding: 0 16px; }
      .card { background: #fff; border: 1px solid rgba(148,163,184,.5); border-radius: 18px; box-shadow: 0 10px 25px rgba(2,6,23,.06); }
      .header { padding: 16px 18px; border-bottom: 1px solid rgba(148,163,184,.35); display:flex; justify-content:space-between; gap:12px; align-items:flex-start;}
      .h1 { font-size: 16px; font-weight: 700; margin: 0; }
      .meta { font-size: 12px; color: rgba(100,116,139,.95); margin-top: 4px; line-height:1.45; }
      .pill { display:inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; border: 1px solid rgba(148,163,184,.5); background: rgba(148,163,184,.08); }
      .content { padding: 16px 18px; }
      @media print {
        body { background: #fff; }
        .wrap { margin: 0; max-width: none; padding: 0; }
        .card { border: 0; box-shadow: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="header">
          <div>
            <div class="pill">Fortis Group EMS</div>
            <h1 class="h1" style="margin-top:10px;">${title}</h1>
            <div class="meta">
              <div><b>Complaint #</b> ${formatReportNumber(report.id)} · <b>${factoryName}</b></div>
              <div><b>Created</b> ${createdAt} · <b>Recorded</b> ${recordedAt}</div>
              <div><b>Status</b> ${report.status}${report.flagged ? " · <b>Flagged</b>" : ""}${report.category ? ` · <b>Category</b> ${report.category}` : ""}${report.assignedTo ? ` · <b>Supervisor</b> ${report.assignedTo}` : ""}${report.handledBy ? ` · <b>Handler</b> ${report.handledBy}` : ""}</div>
            </div>
          </div>
        </div>
        <div class="content">
          ${messagesHtml || "<div style='color:rgba(100,116,139,.95);font-size:13px;'>No messages.</div>"}
        </div>
      </div>
    </div>
  </body>
</html>`;
  }

  function downloadRecord(r: ReportBoxRecord) {
    const html = buildRecordHtml(r);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaint-record_${formatReportNumber(r.reportId).replace("/", "-")}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function printRecord(r: ReportBoxRecord) {
    const html = buildRecordHtml(r);
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      try {
        w.print();
      } catch {
        // ignore
      }
    }, 250);
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="complaints">Complaint box</TabsTrigger>
          <TabsTrigger value="complaint-trend">Complaint trend</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
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
                  <div className="flex items-center gap-2">
                    <div className="tabular-nums">{new Date(r.createdAt).toLocaleString()}</div>
                    <AvatarStack
                      people={getWorkingUsersForComplaint(r)}
                      className="ml-1"
                    />
                  </div>
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

      <TabsContent value="records" className="space-y-4">
        <FilterBar
          left={
            <div className="w-full sm:w-[360px]">
              <SearchInput
                value={recordSearch}
                onChange={setRecordSearch}
                placeholder="Search records..."
              />
            </div>
          }
          onClear={() => setRecordSearch("")}
        />

        {filteredRecords.length ? (
          <div className="grid gap-3">
            {filteredRecords.map((r) => (
              <div key={r.id} className="rounded-xl border bg-card p-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {r.title?.trim() || formatReportNumber(r.reportId)}{" "}
                      <span className="text-muted-foreground font-normal">{"\u2022"}</span>{" "}
                      {getRecordFactoryName(r)}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      Complaint #{formatReportNumber(r.reportId)} {"\u2022"} Recorded{" "}
                      {new Date(r.recordedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => printRecord(r)}>
                      <Printer className="mr-2 size-4" />
                      Print
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadRecord(r)}>
                      <Download className="mr-2 size-4" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setAction({ kind: "remove-record", record: r })}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No records"
            description="Open a complaint drawer and click Record to save a printable download."
          />
        )}
      </TabsContent>

      <DetailPanel
        open={complaintDrawerOpen}
        onOpenChange={(o) => {
          setComplaintDrawerOpen(o);
          if (!o) setSelectedComplaint(null);
        }}
        title={
          selectedComplaint
            ? titleDraft.trim() || formatReportNumber(selectedComplaint.id)
            : "Complaint"
        }
        description={
          selectedComplaint
            ? `${formatReportNumber(selectedComplaint.id)} • ${
                selectedComplaint.facilityId
                  ? getFacilityName(selectedComplaint.facilityId)
                  : "Unknown factory"
              } • ${new Date(selectedComplaint.createdAt).toLocaleString()}`
            : undefined
        }
      >
        {selectedComplaint ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  tone={
                    statusDraft === "handled"
                      ? "compliant"
                      : statusDraft === "triaged"
                        ? "warning"
                        : "info"
                  }
                >
                  {statusDraft}
                </StatusBadge>
                {flaggedDraft ? (
                  <StatusBadge tone="critical">flagged</StatusBadge>
                ) : null}
                {categoryDraft ? (
                  <StatusBadge tone="neutral">
                    {complaintCategories.find((c) => c.value === categoryDraft)?.label ||
                      categoryDraft}
                  </StatusBadge>
                ) : null}
                {drawerDirty ? <StatusBadge tone="neutral">unsaved</StatusBadge> : null}
                {statusDraft === "handled" ? (
                  <div className="text-muted-foreground text-xs">
                    Handler:{" "}
                    <span className="text-foreground font-medium">
                      {selectedComplaint.status === "handled"
                        ? selectedComplaint.handledBy || currentUserLabel
                        : currentUserLabel}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (drawerDirty) {
                      toast.error("Please save first.");
                      return;
                    }
                    setShowValidation(true);
                    const err = validateDrawer();
                    if (err) {
                      toast.error(err);
                      if (err.toLowerCase().includes("note")) noteInputRef.current?.focus();
                      return;
                    }
                    const id = addRecord(selectedComplaint.id);
                    if (id) setTab("records");
                  }}
                  disabled={drawerDirty}
                >
                  Record
                </Button>
                <Button
                  size="sm"
                  onClick={() => void saveDrawer()}
                  disabled={!drawerDirty}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-xs">
                Report title <span className="text-destructive">*</span>
              </div>
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Add a title"
                className={cn(showValidation && !titleDraft.trim() && "border-destructive")}
                aria-invalid={showValidation && !titleDraft.trim() ? true : undefined}
              />
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-xs">Conversation</div>
              <div className="rounded-xl border bg-muted/10 p-3">
                <div className="space-y-2">
                  {selectedComplaint.messages.map((m) => {
                    const isEmsNote =
                      m.kind === "text" &&
                      (m.text || "").toLowerCase().startsWith("ems note:");
                    const displayText = isEmsNote ? stripEmsNotePrefix(m.text) : m.text || "";

                    if (isEmsNote) {
                      return (
                        <div key={m.id} className="flex justify-start">
                          <div className="w-full rounded-xl border border-dotted bg-card/40 px-3 py-2 shadow-sm">
                            <div className="flex items-center gap-2">
                              <StickyNote className="text-muted-foreground size-4" />
                              <div className="text-xs font-semibold tracking-wide">Note</div>
                              <div className="text-muted-foreground/40 ml-auto text-[8px] tabular-nums">
                                {new Date(m.at).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-muted-foreground/60 mt-0.5 text-[10px]">
                              {m.author || "—"}
                            </div>
                            {displayText ? (
                              <div className="mt-1 text-sm leading-relaxed">{displayText}</div>
                            ) : null}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={m.id} className="flex justify-end">
                        <div
                          className={cn(
                            "max-w-[88%] rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 shadow-sm",
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

                  {pendingNotes.map((n) => (
                    <div key={n.id} className="flex justify-start opacity-90">
                      <div className="w-full rounded-xl border border-dotted bg-card/40 px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <StickyNote className="text-muted-foreground size-4" />
                          <div className="text-xs font-semibold tracking-wide">Note</div>
                          <div className="text-muted-foreground ml-2 text-[10px]">
                            pending
                          </div>
                          <div className="text-muted-foreground/40 ml-auto text-[8px] tabular-nums">
                            {new Date(n.at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-muted-foreground/60 mt-0.5 text-[10px]">
                          {n.author}
                        </div>
                        <div className="mt-1 text-sm leading-relaxed">{n.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-muted-foreground text-xs">
                Category <span className="text-destructive">*</span>
              </div>
              <Select
                value={categoryDraft}
                onValueChange={(v) => setCategoryDraft(v)}
              >
                <SelectTrigger
                  className={cn(
                    showValidation && !categoryDraft && "border-destructive",
                  )}
                  aria-invalid={
                    showValidation && !categoryDraft ? true : undefined
                  }
                >
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
              <div className="text-muted-foreground text-xs">
                Supervisor <span className="text-destructive">*</span>
              </div>
              <Select
                value={assigneeDraft}
                onValueChange={(v) => setAssigneeDraft(v)}
              >
                <SelectTrigger
                  className={cn(
                    showValidation && !assigneeDraft && "border-destructive",
                  )}
                  aria-invalid={
                    showValidation && !assigneeDraft ? true : undefined
                  }
                >
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
                variant={flaggedDraft ? "destructive" : "outline"}
                onClick={() => setFlaggedDraft((v) => !v)}
              >
                {flaggedDraft ? (
                  <FlagOff className="mr-2 size-4" />
                ) : (
                  <Flag className="mr-2 size-4" />
                )}
                {flaggedDraft ? "Unflag" : "Flag"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const next = statusDraft === "handled" ? "triaged" : "handled";
                  setStatusDraft(next);
                }}
              >
                <CheckCircle2 className="mr-2 size-4" />
                {statusDraft === "handled" ? "Reopen" : "Mark handled"}
              </Button>
              <Select
                value={statusDraft}
                onValueChange={(v) => setStatusDraft(v as ReportBoxReport["status"])}
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
                onClick={() => setAction({ kind: "delete-complaint", report: selectedComplaint })}
              >
                Delete
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-xs">
                Add note <span className="text-destructive">*</span>
              </div>
              <Textarea
                ref={noteInputRef}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const t = noteDraft.trim();
                    if (!t) {
                      setShowValidation(true);
                      toast.error("Note is required.");
                      return;
                    }
                    setPendingNotes((prev) => [
                      ...prev,
                      {
                        id: createLocalId("pn"),
                        at: new Date().toISOString(),
                        text: t,
                        author: currentUserLabel,
                      },
                    ]);
                    setNoteDraft("");
                  }
                }}
                placeholder="Write a short note..."
                className={cn(
                  "min-h-20",
                  showValidation &&
                    selectedComplaint &&
                    !hasEmsNote(selectedComplaint) &&
                    pendingNotes.length === 0 &&
                    !noteDraft.trim() &&
                    "border-destructive",
                )}
              />
              <div className="text-muted-foreground text-xs">
                Press Enter to add note {"\u2022"} Shift+Enter for new line
              </div>
            </div>
          </div>
        ) : null}
      </DetailPanel>

      <ActionModal
        open={Boolean(action)}
        onOpenChange={(o) => (!o ? setAction(null) : null)}
        tone="destructive"
        title={
          action?.kind === "delete-complaint"
            ? "Delete this complaint?"
            : action?.kind === "remove-record"
              ? "Remove this record?"
              : "Confirm action"
        }
        description={
          action?.kind === "delete-complaint"
            ? "This removes it from the UI and (if it came from inbox files) deletes the inbox copy."
            : action?.kind === "remove-record"
              ? "This removes the saved record. The complaint remains unchanged."
              : undefined
        }
        confirmLabel={action?.kind === "delete-complaint" ? "Delete" : "Remove"}
        onConfirm={async () => {
          if (!action) return;
          if (action.kind === "delete-complaint") {
            await deleteReport(action.report.id);
            setComplaintDrawerOpen(false);
            setSelectedComplaint(null);
            return;
          }
          if (action.kind === "remove-record") {
            removeRecord(action.record.id);
          }
        }}
      />

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
