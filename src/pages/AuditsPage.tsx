import * as React from "react";
import { CalendarDays, ClipboardCheck, ListChecks, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import { auditTemplates, getTemplateById } from "@/data/audit-templates";
import { auditRecords as seedAuditRecords } from "@/data/audit-records";
import { facilities, getFacilityName } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import { Separator } from "@/app/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { PageHeader } from "@/components/PageHeader";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { KPIStatCard } from "@/components/KPIStatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, type DataColumn } from "@/components/DataTable";
import { DetailPanel } from "@/components/DetailPanel";
import { SelectFilter } from "@/components/SelectFilter";
import { formatDate } from "@/utils/format";
import type { AuditItemStatus, AuditFindingRecord, AuditRecord } from "@/types/audit";
import type { FindingSeverity } from "@/types/ems";

const AUDITORS = [
  "Nayem (700901)",
  "Mehedi (70900)",
  "Nimur (700999)",
  "Munna (700902)",
  "Sakib (700903)",
  "Aminul (700905)",
  "Parvej (700906)",
] as const;

const AREAS: Array<{ value: AuditFindingRecord["area"]; label: string }> = [
  { value: "wastewater", label: "Wastewater / ETP" },
  { value: "chemicals", label: "Chemicals" },
  { value: "waste", label: "Waste" },
  { value: "utilities", label: "Utilities" },
  { value: "documents", label: "Documents" },
  { value: "training", label: "Training" },
  { value: "general", label: "General" },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatAuditDate(date: string) {
  if (!date) return "Not scheduled";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Not scheduled";
  return formatDate(date);
}

function defaultStatusesForTemplate(templateId: string) {
  const t = getTemplateById(templateId) ?? auditTemplates[0];
  const out: Record<string, AuditItemStatus> = {};
  for (const s of t.sections) for (const it of s.items) out[it.id] = "pending";
  return out;
}

function computeChecklistStats(
  templateId: string,
  statusesByItemId: Record<string, AuditItemStatus>,
) {
  const template = getTemplateById(templateId) ?? auditTemplates[0];
  const itemIds = template.sections.flatMap((s) => s.items.map((i) => i.id));
  const statuses = itemIds.map((id) => statusesByItemId[id] ?? "pending");
  const total = statuses.length || 1;
  const completed = statuses.filter((s) => s !== "pending").length;
  const progress = Math.round((completed / total) * 100);
  const relevant = statuses.filter((s) => s !== "na");
  const scoreTotal = relevant.length || 1;
  const scorePoints = relevant.reduce((sum, s) => {
    if (s === "pass") return sum + 1;
    if (s === "pending") return sum + 0.5;
    return sum;
  }, 0);
  const score = Math.round((scorePoints / scoreTotal) * 100);
  const fail = statuses.filter((s) => s === "fail").length;
  const pending = statuses.filter((s) => s === "pending").length;
  return { template, total, completed, progress, score, fail, pending };
}

function getStatusMeta(status: AuditItemStatus) {
  switch (status) {
    case "pass":
      return {
        label: "Pass",
        dot: "bg-[var(--success-600)]",
        chip: "border-[var(--success-100)] bg-[var(--success-50)] text-[var(--success-900)]",
      };
    case "fail":
      return {
        label: "Fail",
        dot: "bg-[var(--critical-600)]",
        chip: "border-[var(--critical-100)] bg-[var(--critical-50)] text-[var(--critical-900)]",
      };
    case "na":
      return {
        label: "N/A",
        dot: "bg-border",
        chip: "border-border bg-muted/30 text-muted-foreground",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        dot: "bg-[var(--warning-600)]",
        chip: "border-[var(--warning-100)] bg-[var(--warning-50)] text-[var(--warning-900)]",
      };
  }
}

type FindingDraft = {
  id: string;
  severity: FindingSeverity;
  area: AuditFindingRecord["area"];
  title: string;
  status: AuditFindingRecord["status"];
  owner?: string;
  dueDate?: string;
};

export function AuditsPage() {
  const navigate = useNavigate();
  const [records, setRecords] = React.useState<AuditRecord[]>(() => seedAuditRecords);
  const [selected, setSelected] = React.useState<AuditRecord | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [createTab, setCreateTab] = React.useState<"setup" | "checklist" | "findings">(
    "setup",
  );
  const [createDraft, setCreateDraft] = React.useState(() => ({
    name: "",
    factoryId: "",
    templateId: "tmpl_garments_env_compliance",
    auditor: "",
    statusesByItemId: defaultStatusesForTemplate("tmpl_garments_env_compliance"),
    overallScoreOverride: "" as string,
    findings: [] as FindingDraft[],
  }));

  React.useEffect(() => {
    if (!createOpen) return;
    setCreateTab("setup");
    setCreateDraft({
      name: "",
      factoryId: "",
      templateId: "tmpl_garments_env_compliance",
      auditor: "",
      statusesByItemId: defaultStatusesForTemplate("tmpl_garments_env_compliance"),
      overallScoreOverride: "",
      findings: [],
    });
  }, [createOpen]);

  const createStats = React.useMemo(
    () => computeChecklistStats(createDraft.templateId, createDraft.statusesByItemId),
    [createDraft.templateId, createDraft.statusesByItemId],
  );

  const sorted = React.useMemo(() => {
    return records
      .slice()
      .sort((a, b) => {
        const at = a.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
        const bt = b.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
        return at - bt;
      });
  }, [records]);

  const total = records.length;
  const inProgress = records.filter((a) => a.progress > 0 && a.progress < 100).length;
  const criticalFindings = records.reduce((sum, a) => sum + a.findingsCount.critical, 0);

  const upcomingList = React.useMemo(
    () => sorted.filter((a) => Boolean(a.date) && a.progress < 100).slice(0, 6),
    [sorted],
  );
  const completedList = React.useMemo(
    () => sorted.filter((a) => a.progress >= 100).slice(0, 6),
    [sorted],
  );
  const unscheduledList = React.useMemo(
    () => sorted.filter((a) => !a.date).slice(0, 6),
    [sorted],
  );

  const cols: Array<DataColumn<AuditRecord>> = [
    {
      id: "name",
      header: "Audit",
      cell: (a) => {
        const templateName = getTemplateById(a.templateId)?.name ?? "Template";
        return (
          <div className="min-w-0">
            <div className="break-words text-sm font-medium leading-snug md:truncate">
              {a.name}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              {getFacilityName(a.facilityId)} • {formatAuditDate(a.date)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge tone="neutral">{templateName}</StatusBadge>
              <StatusBadge
                tone={
                  a.overallScore >= 85
                    ? "compliant"
                    : a.overallScore >= 70
                      ? "warning"
                      : "critical"
                }
              >
                Score {a.overallScore}%
              </StatusBadge>
            </div>
          </div>
        );
      },
      className: "whitespace-normal",
    },
    {
      id: "progress",
      header: "Checklist",
      cell: (a) => (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{a.progress}%</span>
          </div>
          <Progress value={a.progress} className="mt-2" />
        </div>
      ),
      className: "hidden lg:table-cell whitespace-normal",
    },
    {
      id: "findings",
      header: "Findings",
      cell: (a) => (
        <div className="flex flex-wrap justify-end gap-2">
          <StatusBadge tone="neutral">Minor {a.findingsCount.minor}</StatusBadge>
          <StatusBadge tone="warning">Major {a.findingsCount.major}</StatusBadge>
          <StatusBadge tone="critical">Critical {a.findingsCount.critical}</StatusBadge>
        </div>
      ),
      className: "hidden xl:table-cell text-right whitespace-normal",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audits"
        actions={
          <CreateActionDialog
            title="Create audit"
            submitLabel="Create"
            open={createOpen}
            onOpenChange={setCreateOpen}
            contentClassName="sm:max-w-3xl max-h-[85vh] overflow-y-auto"
            onCreate={() => {
              if (!createDraft.name.trim()) {
                toast.error("Audit name is required");
                setCreateTab("setup");
                return false;
              }
              if (!createDraft.factoryId) {
                toast.error("Select a factory");
                setCreateTab("setup");
                return false;
              }
              if (!createDraft.auditor) {
                toast.error("Select an auditor");
                setCreateTab("setup");
                return false;
              }

              const now = new Date();
              const findings: AuditFindingRecord[] = createDraft.findings
                .filter((f) => f.title.trim())
                .map((f) => ({
                  id: f.id,
                  severity: f.severity,
                  area: f.area,
                  title: f.title.trim(),
                  status: f.status,
                  owner: f.owner,
                  dueDate: f.dueDate,
                  evidenceCount: 0,
                }));

              const findingsCount = {
                minor: findings.filter((f) => f.severity === "minor").length,
                major: findings.filter((f) => f.severity === "major").length,
                critical: findings.filter((f) => f.severity === "critical").length,
              };

              const checklist = Object.entries(createDraft.statusesByItemId).map(
                ([itemId, status]) => ({
                  itemId,
                  status,
                  evidenceCount: status === "pass" ? 1 : 0,
                }),
              );

              const computed = computeChecklistStats(
                createDraft.templateId,
                createDraft.statusesByItemId,
              );

              const overallScore =
                createDraft.overallScoreOverride.trim().length > 0
                  ? clamp(Number(createDraft.overallScoreOverride) || 0, 0, 100)
                  : computed.score;

              const record: AuditRecord = {
                id: `audit_${Date.now()}`,
                facilityId: createDraft.factoryId,
                name: createDraft.name.trim(),
                date: "",
                auditor: createDraft.auditor,
                progress: computed.progress,
                overallScore,
                findingsCount,
                templateId: createDraft.templateId,
                createdAt: now.toISOString(),
                checklist,
                findings,
              };

              setRecords((prev) => [record, ...prev]);
              toast.success("Audit created (mock)");
              return true;
            }}
          >
            <Tabs value={createTab} onValueChange={(v) => setCreateTab(v as any)} className="w-full">
              <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-xl border p-1">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="mt-3 m-0 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5 sm:col-span-2">
                    <div className="text-muted-foreground text-xs">Audit name</div>
                    <Input
                      value={createDraft.name}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. Garments Environmental Compliance"
                    />
                  </div>

                  <div className="grid gap-1.5 sm:col-span-2">
                    <div className="text-muted-foreground text-xs">Template</div>
                    <SelectFilter
                      value={createDraft.templateId}
                      onChange={(value) => {
                        setCreateDraft((p) => ({
                          ...p,
                          templateId: value,
                          statusesByItemId: defaultStatusesForTemplate(value),
                        }));
                      }}
                      placeholder="Select template"
                      items={auditTemplates.map((t) => ({ value: t.id, label: t.name }))}
                    />
                    <div className="text-muted-foreground text-xs">
                      {createStats.template.description}
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <div className="text-muted-foreground text-xs">Factory</div>
                    <SelectFilter
                      value={createDraft.factoryId || undefined}
                      onChange={(value) =>
                        setCreateDraft((p) => ({ ...p, factoryId: value }))
                      }
                      placeholder="Select factory"
                      items={facilities.map((f) => ({ value: f.id, label: f.name }))}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <div className="text-muted-foreground text-xs">Auditor</div>
                    <SelectFilter
                      value={createDraft.auditor || undefined}
                      onChange={(value) =>
                        setCreateDraft((p) => ({ ...p, auditor: value }))
                      }
                      placeholder="Select auditor"
                      items={AUDITORS.map((a) => ({ value: a, label: a }))}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <div className="text-muted-foreground text-xs">Score override (optional)</div>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={createDraft.overallScoreOverride}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, overallScoreOverride: e.target.value }))
                      }
                      placeholder={`${createStats.score}`}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <div className="text-muted-foreground text-xs">Schedule</div>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate("/audit-calendar")}
                    >
                      Open audit calendar
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ListChecks className="size-4" />
                      Checklist completion
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        tone={
                          createStats.progress >= 85
                            ? "compliant"
                            : createStats.progress >= 70
                              ? "warning"
                              : "critical"
                        }
                      >
                        {createStats.progress}%
                      </StatusBadge>
                      <StatusBadge
                        tone={
                          createStats.score >= 85
                            ? "compliant"
                            : createStats.score >= 70
                              ? "warning"
                              : "critical"
                        }
                      >
                        Score {createStats.score}%
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={createStats.progress} />
                  </div>
                  <div className="text-muted-foreground mt-2 text-xs">
                    Completed {createStats.completed}/{createStats.total} • Pending {createStats.pending} • Fail {createStats.fail}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="checklist" className="mt-3 m-0 space-y-4">
                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">Checklist</div>
                    <StatusBadge
                      tone={
                        createStats.progress >= 85
                          ? "compliant"
                          : createStats.progress >= 70
                            ? "warning"
                            : "critical"
                      }
                    >
                      {createStats.progress}% complete
                    </StatusBadge>
                  </div>
                  <div className="mt-2">
                    <Progress value={createStats.progress} />
                  </div>
                  <div className="text-muted-foreground mt-2 text-xs">
                    Light mode: choose status per requirement; keep most as Pending until evidence is ready.
                  </div>
                </div>

                <Accordion
                  type="multiple"
                  defaultValue={[createStats.template.sections[0]?.id].filter(Boolean) as string[]}
                  className="w-full"
                >
                  {createStats.template.sections.map((section) => {
                    const counts = section.items.reduce(
                      (acc, it) => {
                        const v = createDraft.statusesByItemId[it.id] ?? "pending";
                        acc[v] += 1;
                        return acc;
                      },
                      { pass: 0, fail: 0, na: 0, pending: 0 } as Record<AuditItemStatus, number>,
                    );

                    return (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex w-full items-center justify-between gap-3 pr-2">
                            <span className="truncate text-sm font-medium">{section.title}</span>
                            <span className="flex shrink-0 items-center gap-2">
                              {counts.fail ? (
                                <StatusBadge tone="critical">Fail {counts.fail}</StatusBadge>
                              ) : null}
                              {counts.pending ? (
                                <StatusBadge tone="warning">Pending {counts.pending}</StatusBadge>
                              ) : null}
                              {counts.pass ? (
                                <StatusBadge tone="compliant">Pass {counts.pass}</StatusBadge>
                              ) : null}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCreateDraft((p) => ({
                                  ...p,
                                  statusesByItemId: {
                                    ...p.statusesByItemId,
                                    ...Object.fromEntries(section.items.map((it) => [it.id, "pass"])),
                                  },
                                }));
                              }}
                            >
                              Mark all pass
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCreateDraft((p) => ({
                                  ...p,
                                  statusesByItemId: {
                                    ...p.statusesByItemId,
                                    ...Object.fromEntries(section.items.map((it) => [it.id, "pending"])),
                                  },
                                }));
                              }}
                            >
                              Reset pending
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {section.items.map((it) => {
                              const value = (createDraft.statusesByItemId[it.id] ?? "pending") as AuditItemStatus;
                              const meta = getStatusMeta(value);

                              return (
                                <div
                                  key={it.id}
                                  className="flex flex-col gap-2 rounded-lg border p-2 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm">{it.label}</div>
                                    {it.hint ? (
                                      <div className="text-muted-foreground mt-1 text-xs">
                                        {it.hint}
                                      </div>
                                    ) : null}
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className={`h-8 min-w-[130px] justify-between rounded-full px-2 ${meta.chip}`}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span className={`size-2 rounded-full ${meta.dot}`} />
                                          <span className="text-xs font-medium">{meta.label}</span>
                                        </span>
                                        <span className="text-muted-foreground text-xs">Change</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                      <DropdownMenuRadioGroup
                                        value={value}
                                        onValueChange={(next) => {
                                          setCreateDraft((p) => ({
                                            ...p,
                                            statusesByItemId: {
                                              ...p.statusesByItemId,
                                              [it.id]: next as AuditItemStatus,
                                            },
                                          }));
                                        }}
                                      >
                                        <DropdownMenuRadioItem value="pass">
                                          Pass
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="fail">
                                          Fail
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="na">
                                          N/A
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="pending">
                                          Pending
                                        </DropdownMenuRadioItem>
                                      </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>

              <TabsContent value="findings" className="mt-3 m-0 space-y-4">
                {(() => {
                  const counts = createDraft.findings.reduce(
                    (acc, f) => {
                      acc[f.severity] += 1;
                      acc.status[f.status] += 1;
                      return acc;
                    },
                    {
                      minor: 0,
                      major: 0,
                      critical: 0,
                      status: { open: 0, in_progress: 0, closed: 0 },
                    },
                  );

                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium">Findings</div>
                        {createDraft.findings.length ? (
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge tone="neutral">Minor {counts.minor}</StatusBadge>
                            <StatusBadge tone="warning">Major {counts.major}</StatusBadge>
                            <StatusBadge tone="critical">Critical {counts.critical}</StatusBadge>
                          </div>
                        ) : null}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setCreateDraft((p) => ({
                            ...p,
                            findings: [
                              ...p.findings,
                              {
                                id: `finding_${Date.now()}`,
                                severity: "major",
                                area: "general",
                                title: "",
                                status: "open",
                                owner: "Nayem (700901)",
                              },
                            ],
                          }))
                        }
                      >
                        Add finding
                      </Button>
                    </div>
                  );
                })()}

                {createDraft.findings.length ? (
                  <div className="space-y-2">
                    {createDraft.findings.map((f) => {
                      const severityTone =
                        f.severity === "critical"
                          ? "critical"
                          : f.severity === "major"
                            ? "warning"
                            : "neutral";

                      return (
                        <Collapsible
                          key={f.id}
                          defaultOpen={!f.title.trim()}
                          className="rounded-xl border"
                        >
                          <div className="flex items-start gap-2 p-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge tone={severityTone}>{f.severity}</StatusBadge>
                                <StatusBadge tone="neutral">{f.status.replace("_", " ")}</StatusBadge>
                                <StatusBadge tone="neutral">{AREAS.find((a) => a.value === f.area)?.label ?? f.area}</StatusBadge>
                              </div>
                              <div className="mt-2">
                                <Input
                                  value={f.title}
                                  onChange={(e) =>
                                    setCreateDraft((p) => ({
                                      ...p,
                                      findings: p.findings.map((x) =>
                                        x.id === f.id ? { ...x, title: e.target.value } : x,
                                      ),
                                    }))
                                  }
                                  placeholder="Finding title"
                                />
                              </div>
                              {f.owner || f.dueDate ? (
                                <div className="text-muted-foreground mt-2 text-xs">
                                  {f.owner ? f.owner : "Unassigned"}
                                  {f.dueDate ? ` • Due ${formatAuditDate(f.dueDate)}` : ""}
                                </div>
                              ) : null}
                            </div>

                            <div className="flex shrink-0 items-center gap-2 pt-1">
                              <CollapsibleTrigger asChild>
                                <Button type="button" size="sm" variant="outline">
                                  Details
                                </Button>
                              </CollapsibleTrigger>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setCreateDraft((p) => ({
                                    ...p,
                                    findings: p.findings.filter((x) => x.id !== f.id),
                                  }))
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </div>

                          <CollapsibleContent>
                            <Separator />
                            <div className="grid gap-3 p-3 sm:grid-cols-2">
                              <div className="grid gap-1.5">
                                <div className="text-muted-foreground text-xs">Severity</div>
                                <SelectFilter
                                  value={f.severity}
                                  onChange={(v) =>
                                    setCreateDraft((p) => ({
                                      ...p,
                                      findings: p.findings.map((x) =>
                                        x.id === f.id ? { ...x, severity: v as any } : x,
                                      ),
                                    }))
                                  }
                                  placeholder="Select severity"
                                  items={[
                                    { value: "minor", label: "Minor" },
                                    { value: "major", label: "Major" },
                                    { value: "critical", label: "Critical" },
                                  ]}
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <div className="text-muted-foreground text-xs">Area</div>
                                <SelectFilter
                                  value={f.area}
                                  onChange={(v) =>
                                    setCreateDraft((p) => ({
                                      ...p,
                                      findings: p.findings.map((x) =>
                                        x.id === f.id ? { ...x, area: v as any } : x,
                                      ),
                                    }))
                                  }
                                  placeholder="Select area"
                                  items={AREAS}
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <div className="text-muted-foreground text-xs">Owner</div>
                                <SelectFilter
                                  value={f.owner}
                                  onChange={(v) =>
                                    setCreateDraft((p) => ({
                                      ...p,
                                      findings: p.findings.map((x) =>
                                        x.id === f.id ? { ...x, owner: v } : x,
                                      ),
                                    }))
                                  }
                                  placeholder="Select owner"
                                  items={AUDITORS.map((a) => ({ value: a, label: a }))}
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <div className="text-muted-foreground text-xs">Status</div>
                                <SelectFilter
                                  value={f.status}
                                  onChange={(v) =>
                                    setCreateDraft((p) => ({
                                      ...p,
                                      findings: p.findings.map((x) =>
                                        x.id === f.id ? { ...x, status: v as any } : x,
                                      ),
                                    }))
                                  }
                                  placeholder="Select status"
                                  items={[
                                    { value: "open", label: "Open" },
                                    { value: "in_progress", label: "In progress" },
                                    { value: "closed", label: "Closed" },
                                  ]}
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <div className="text-muted-foreground text-xs">Due date</div>
                                <Input
                                  type="date"
                                  value={f.dueDate ?? ""}
                                  onChange={(e) =>
                                    setCreateDraft((p) => ({
                                      ...p,
                                      findings: p.findings.map((x) =>
                                        x.id === f.id ? { ...x, dueDate: e.target.value } : x,
                                      ),
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground grid place-items-center rounded-xl border p-6 text-sm">
                    No findings added
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CreateActionDialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPIStatCard title="Audits" value={total} icon={ShieldCheck} tone="info" />
        <KPIStatCard
          title="In progress"
          value={inProgress}
          icon={ClipboardCheck}
          tone={inProgress > 0 ? "warning" : "compliant"}
        />
        <KPIStatCard
          title="Critical findings"
          value={criticalFindings}
          helper="Across audits"
          tone={criticalFindings > 0 ? "critical" : "compliant"}
        />
        <KPIStatCard
          title="Factories"
          value={facilities.length}
          icon={CalendarDays}
          tone="neutral"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-xs xl:col-span-2">
          <CardHeader>
            <CardTitle>Audit list</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable
              rows={sorted}
              columns={cols}
              rowKey={(a) => a.id}
              onRowClick={(row) => setSelected(row)}
              className="hide-scrollbar"
            />
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Audits</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-xl border p-1">
                <TabsTrigger value="upcoming">
                  Upcoming{" "}
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({upcomingList.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed{" "}
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({completedList.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger value="unscheduled">
                  Unscheduled{" "}
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({unscheduledList.length})
                  </span>
                </TabsTrigger>
              </TabsList>

              {(
                [
                  { key: "upcoming", list: upcomingList },
                  { key: "completed", list: completedList },
                  { key: "unscheduled", list: unscheduledList },
                ] as const
              ).map((tab) => (
                <TabsContent
                  key={tab.key}
                  value={tab.key}
                  className="mt-3 m-0 space-y-3"
                >
                  {tab.list.map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className="w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{a.name}</div>
                          <div className="text-muted-foreground mt-1 text-xs">
                            {getFacilityName(a.facilityId)} • {formatAuditDate(a.date)}
                          </div>
                        </div>
                        <StatusBadge
                          tone={
                            a.progress >= 85
                              ? "compliant"
                              : a.progress >= 70
                                ? "warning"
                                : "critical"
                          }
                        >
                          {a.progress}%
                        </StatusBadge>
                      </div>
                    </button>
                  ))}
                  {!tab.list.length ? (
                    <div className="text-muted-foreground grid place-items-center rounded-xl border p-6 text-sm">
                      No audits
                    </div>
                  ) : null}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? selected.name : "Audit"}
        description={
          selected
            ? `${getFacilityName(selected.facilityId)} • ${formatAuditDate(selected.date)}`
            : undefined
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Template</div>
                <div className="mt-1 text-sm font-medium">
                  {getTemplateById(selected.templateId)?.name ?? "Template"}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Auditor</div>
                <div className="mt-1 text-sm font-medium">{selected.auditor}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Completion</div>
                <div className="mt-2">
                  <Progress value={selected.progress} />
                </div>
                <div className="text-muted-foreground mt-2 text-xs">
                  {selected.progress}% complete
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Score</div>
                <div className="mt-1">
                  <StatusBadge
                    tone={
                      selected.overallScore >= 85
                        ? "compliant"
                        : selected.overallScore >= 70
                          ? "warning"
                          : "critical"
                    }
                  >
                    {selected.overallScore}%
                  </StatusBadge>
                </div>
                <div className="text-muted-foreground mt-2 text-xs">
                  {selected.date ? "Scheduled" : "Schedule from calendar"}
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">Findings</div>
                <div className="flex flex-wrap justify-end gap-2">
                  <StatusBadge tone="neutral">
                    Minor {selected.findingsCount.minor}
                  </StatusBadge>
                  <StatusBadge tone="warning">
                    Major {selected.findingsCount.major}
                  </StatusBadge>
                  <StatusBadge tone="critical">
                    Critical {selected.findingsCount.critical}
                  </StatusBadge>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {selected.findings.slice(0, 6).map((f) => (
                  <div key={f.id} className="rounded-md border p-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{f.title}</div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          {f.area} • {f.status}
                          {f.owner ? ` • ${f.owner}` : ""}
                        </div>
                      </div>
                      <StatusBadge
                        tone={
                          f.severity === "critical"
                            ? "critical"
                            : f.severity === "major"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {f.severity}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
                {!selected.findings.length ? (
                  <div className="text-muted-foreground text-sm">
                    No findings recorded.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/audit-calendar")}>
                Open audit calendar
              </Button>
              {selected.findingsCount.critical + selected.findingsCount.major > 0 ? (
                <Button variant="outline" onClick={() => navigate("/capa")}>
                  Open CAPA
                </Button>
              ) : null}
              <Button onClick={() => toast.message("Audit detail view (next step)")}>
                Open details
              </Button>
            </div>

            <Separator />
            <div className="text-muted-foreground text-xs">
              This module supports full checklist + findings capture. Templates can be refined to match your exact certificate requirements.
            </div>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}
