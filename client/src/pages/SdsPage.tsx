import * as React from "react";
import { FileSearch, FileText, Search, X } from "lucide-react";
import { toast } from "@/app/lib/toast";

import { sdsRecords } from "@/data/mock";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { PageHeader } from "@/components/PageHeader";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { KPIStatCard } from "@/components/KPIStatCard";
import { PageKpiGrid } from "@/components/PageKpiGrid";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/format";
import { Textarea } from "@/app/components/ui/textarea";
import { SelectFilter } from "@/components/SelectFilter";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/app/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

const SDS_SECTION_DEFS = [
  { id: "1", title: "Identification" },
  { id: "2", title: "Hazard(s) identification" },
  { id: "3", title: "Composition / information on ingredients" },
  { id: "4", title: "First-aid measures" },
  { id: "5", title: "Fire-fighting measures" },
  { id: "6", title: "Accidental release measures" },
  { id: "7", title: "Handling and storage" },
  { id: "8", title: "Exposure controls / personal protection" },
  { id: "9", title: "Physical and chemical properties" },
  { id: "10", title: "Stability and reactivity" },
  { id: "11", title: "Toxicological information" },
  { id: "12", title: "Ecological information" },
  { id: "13", title: "Disposal considerations" },
  { id: "14", title: "Transport information" },
  { id: "15", title: "Regulatory information" },
  { id: "16", title: "Other information" },
] as const;

const SDS_SECTION_TABS: Array<{
  id: "1-4" | "5-8" | "9-12" | "13-16";
  label: string;
  sectionIds: string[];
}> = [
  { id: "1-4", label: "1-4", sectionIds: ["1", "2", "3", "4"] },
  { id: "5-8", label: "5-8", sectionIds: ["5", "6", "7", "8"] },
  { id: "9-12", label: "9-12", sectionIds: ["9", "10", "11", "12"] },
  { id: "13-16", label: "13-16", sectionIds: ["13", "14", "15", "16"] },
];

export function SdsPage() {
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>(sdsRecords[0]?.id ?? "");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editDraftBySectionId, setEditDraftBySectionId] = React.useState<Record<string, string>>({});
  const [editTab, setEditTab] = React.useState<string>("1-4");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDraftBySectionId, setCreateDraftBySectionId] = React.useState<Record<string, string>>({});
  const [createTab, setCreateTab] = React.useState<string>("1-4");
  const [createMeta, setCreateMeta] = React.useState({
    chemicalName: "",
    supplier: "",
    language: "",
    revisionDate: "",
    notes: "",
  });
  const [createErrors, setCreateErrors] = React.useState<Record<string, string>>({});

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sdsRecords;
    return sdsRecords.filter((s) => {
      return (
        s.chemicalName.toLowerCase().includes(q) ||
        s.supplier.toLowerCase().includes(q) ||
        s.fileName.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const selected = React.useMemo(
    () => sdsRecords.find((s) => s.id === selectedId) ?? filtered[0],
    [selectedId, filtered],
  );

  React.useEffect(() => {
    if (!editOpen || !selected) return;
    setEditTab("1-4");
    const next: Record<string, string> = {};
    for (const sec of selected.sections) next[sec.id] = sec.summary ?? "";
    for (const def of SDS_SECTION_DEFS) {
      if (next[def.id] == null) next[def.id] = "";
    }
    setEditDraftBySectionId(next);
  }, [editOpen, selected?.id]);

  React.useEffect(() => {
    if (!createOpen) return;
    setCreateTab("1-4");
    setCreateErrors({});
    setCreateMeta({
      chemicalName: "",
      supplier: "",
      language: "",
      revisionDate: "",
      notes: "",
    });
    const next: Record<string, string> = {};
    for (const def of SDS_SECTION_DEFS) next[def.id] = "";
    setCreateDraftBySectionId(next);
  }, [createOpen]);

  const sectionTitleById = React.useMemo(() => {
    const out: Record<string, string> = {};
    for (const def of SDS_SECTION_DEFS) out[def.id] = def.title;
    return out;
  }, []);

  const validateCreate = React.useCallback(() => {
    const nextErrors: Record<string, string> = {};

    if (!createMeta.chemicalName.trim()) nextErrors.chemicalName = "Required";
    if (!createMeta.supplier.trim()) nextErrors.supplier = "Required";
    if (!createMeta.language.trim()) nextErrors.language = "Required";
    if (!createMeta.revisionDate.trim()) nextErrors.revisionDate = "Required";

    for (const def of SDS_SECTION_DEFS) {
      const v = (createDraftBySectionId[def.id] ?? "").trim();
      if (!v) nextErrors[`sec_${def.id}`] = "Required";
      else if (v.length < 8) nextErrors[`sec_${def.id}`] = "Too short";
    }

    return nextErrors;
  }, [createDraftBySectionId, createMeta]);

  const focusFirstCreateErrorTab = React.useCallback((errors: Record<string, string>) => {
    const secErrorKey = Object.keys(errors).find((k) => k.startsWith("sec_"));
    if (!secErrorKey) return;
    const secId = secErrorKey.replace("sec_", "");
    const tab = SDS_SECTION_TABS.find((t) => t.sectionIds.includes(secId));
    if (tab) setCreateTab(tab.id);
  }, []);

  const suppliers = React.useMemo(
    () => new Set(sdsRecords.map((s) => s.supplier)).size,
    [],
  );
  const latestRevision = React.useMemo(
    () => sdsRecords.map((s) => s.revisionDate).sort().slice(-1)[0],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <CreateActionDialog
            title="Create SDS record"
            open={createOpen}
            onOpenChange={setCreateOpen}
            contentClassName="sm:max-w-2xl max-h-[80vh] overflow-y-auto"
            onCreate={async () => {
              const nextErrors = validateCreate();
              setCreateErrors(nextErrors);
              if (Object.keys(nextErrors).length) {
                focusFirstCreateErrorTab(nextErrors);
                toast.error("Fill all required fields");
                return false;
              }
              toast.success("SDS created (mock)");
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Chemical name</div>
                <Input
                  value={createMeta.chemicalName}
                  onChange={(e) =>
                    setCreateMeta((p) => ({ ...p, chemicalName: e.target.value }))
                  }
                  className={createErrors.chemicalName ? "border-destructive" : ""}
                  placeholder="Chemical name"
                />
                {createErrors.chemicalName ? (
                  <div className="text-destructive text-xs">{createErrors.chemicalName}</div>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Supplier</div>
                <Input
                  value={createMeta.supplier}
                  onChange={(e) =>
                    setCreateMeta((p) => ({ ...p, supplier: e.target.value }))
                  }
                  className={createErrors.supplier ? "border-destructive" : ""}
                  placeholder="Supplier"
                />
                {createErrors.supplier ? (
                  <div className="text-destructive text-xs">{createErrors.supplier}</div>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Language</div>
                <SelectFilter
                  value={createMeta.language || undefined}
                  onChange={(value) => {
                    setCreateMeta((p) => ({ ...p, language: value }));
                  }}
                  placeholder="Select language"
                  items={[
                    { value: "English", label: "English" },
                    { value: "Bangla", label: "Bangla" },
                  ]}
                />
                {createErrors.language ? (
                  <div className="text-destructive text-xs">{createErrors.language}</div>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Revision date</div>
                <Input
                  type="date"
                  value={createMeta.revisionDate}
                  onChange={(e) =>
                    setCreateMeta((p) => ({ ...p, revisionDate: e.target.value }))
                  }
                  className={createErrors.revisionDate ? "border-destructive" : ""}
                />
                {createErrors.revisionDate ? (
                  <div className="text-destructive text-xs">{createErrors.revisionDate}</div>
                ) : null}
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">File</div>
                <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                  Upload SDS PDF (placeholder)
                </div>
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Notes</div>
                <Textarea
                  value={createMeta.notes}
                  onChange={(e) =>
                    setCreateMeta((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <Separator className="my-1" />

            <Tabs value={createTab} onValueChange={setCreateTab} className="w-full">
              <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:grid-cols-4">
                {SDS_SECTION_TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id} className="gap-2">
                    <span className="text-xs font-semibold">{t.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {SDS_SECTION_TABS.map((t) => (
                <TabsContent key={t.id} value={t.id} className="mt-3 m-0">
                  <div className="grid gap-3">
                    {t.sectionIds.map((secId) => {
                      const title = sectionTitleById[secId] ?? `Section ${secId}`;
                      const err = createErrors[`sec_${secId}`];
                      return (
                        <div key={secId} className="grid gap-1.5">
                          <div className="text-muted-foreground text-xs">
                            Section {secId}: {title}
                          </div>
                          <Textarea
                            value={createDraftBySectionId[secId] ?? ""}
                            onChange={(e) =>
                              setCreateDraftBySectionId((prev) => ({
                                ...prev,
                                [secId]: e.target.value,
                              }))
                            }
                            rows={4}
                            className={err ? "border-destructive" : ""}
                            placeholder="Type section details..."
                          />
                          {err ? <div className="text-destructive text-xs">{err}</div> : null}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CreateActionDialog>
        }
      />

      <PageKpiGrid columnsClassName="sm:grid-cols-2 md:grid-cols-3">
        <KPIStatCard title="SDS records" value={sdsRecords.length} icon={FileText} tone="info" />
        <KPIStatCard title="Suppliers" value={suppliers} tone="neutral" />
        <KPIStatCard
          title="Latest revision"
          value={latestRevision ? formatDate(latestRevision) : "-"}
        />
      </PageKpiGrid>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle>SDS list</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chemical / supplier..."
            />
          </div>

          <div className="mt-3 space-y-2">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id);
                  setDrawerOpen(true);
                }}
                className={`
                  w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/40
                  ${s.id === selected?.id ? "bg-muted/40" : ""}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{s.chemicalName}</div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {s.supplier} - Rev {formatDate(s.revisionDate)}
                    </div>
                    <div className="text-muted-foreground mt-1 truncate text-xs">{s.fileName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone="info">{s.language}</StatusBadge>
                    <StatusBadge tone="neutral">Preview</StatusBadge>
                  </div>
                </div>
              </button>
            ))}
            {!filtered.length ? (
              <div className="text-muted-foreground grid place-items-center gap-2 rounded-xl border p-8 text-sm">
                <FileSearch className="size-5" />
                No SDS found
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent className="sm:max-w-xl">
          <DrawerHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DrawerTitle className="truncate">{selected?.chemicalName ?? "SDS"}</DrawerTitle>
                {selected ? (
                  <div className="text-muted-foreground mt-1 text-sm">
                    {selected.supplier} - Rev {formatDate(selected.revisionDate)}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <Separator />

          <div className="flex-1 overflow-y-auto p-4">
            {selected ? (
              <div className="space-y-4">
                <div className="rounded-xl border p-3">
                  <div className="text-muted-foreground text-xs">File</div>
                  <div className="mt-1 text-sm font-medium">{selected.fileName}</div>
                </div>

                <Accordion type="multiple" defaultValue={["1"]} className="w-full">
                  {selected.sections.map((sec) => (
                    <AccordionItem key={sec.id} value={sec.id}>
                      <AccordionTrigger>
                        <span className="flex min-w-0 items-center gap-2">
                          <StatusBadge tone="neutral">Section {sec.id}</StatusBadge>
                          <span className="truncate">{sec.title}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-muted-foreground text-sm">{sec.summary || "-"}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Select an SDS record.</div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <CreateActionDialog
        title="Edit SDS record"
        submitLabel="Save"
        open={editOpen}
        onOpenChange={setEditOpen}
        hideTrigger
        contentClassName="sm:max-w-2xl max-h-[80vh] overflow-y-auto"
        onCreate={async () => {
          toast.success("SDS saved (mock)");
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <div className="text-muted-foreground text-xs">Chemical name</div>
            <Input defaultValue={selected?.chemicalName ?? ""} placeholder="Chemical name" />
          </div>
          <div className="grid gap-1.5">
            <div className="text-muted-foreground text-xs">Supplier</div>
            <Input defaultValue={selected?.supplier ?? ""} placeholder="Supplier" />
          </div>
          <div className="grid gap-1.5">
            <div className="text-muted-foreground text-xs">Language</div>
            <SelectFilter
              value={selected?.language}
              onChange={(value) => {
                void value;
              }}
              placeholder="Select language"
              items={[
                { value: "English", label: "English" },
                { value: "Bangla", label: "Bangla" },
              ]}
            />
          </div>
          <div className="grid gap-1.5">
            <div className="text-muted-foreground text-xs">Revision date</div>
            <Input type="date" defaultValue={selected?.revisionDate ?? ""} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <div className="text-muted-foreground text-xs">File</div>
            <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
              Replace SDS PDF (placeholder)
            </div>
          </div>
        </div>

        <Separator className="my-1" />

        <Tabs value={editTab} onValueChange={setEditTab} className="w-full">
          <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:grid-cols-4">
            {SDS_SECTION_TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="gap-2">
                <span className="text-xs font-semibold">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {SDS_SECTION_TABS.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-3 m-0">
              <div className="grid gap-3">
                {t.sectionIds.map((secId) => {
                  const title = sectionTitleById[secId] ?? `Section ${secId}`;
                  return (
                    <div key={secId} className="grid gap-1.5">
                      <div className="text-muted-foreground text-xs">
                        Section {secId}: {title}
                      </div>
                      <Textarea
                        value={editDraftBySectionId[secId] ?? ""}
                        onChange={(e) =>
                          setEditDraftBySectionId((prev) => ({
                            ...prev,
                            [secId]: e.target.value,
                          }))
                        }
                        rows={4}
                        placeholder="Type section details..."
                      />
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CreateActionDialog>
    </div>
  );
}
