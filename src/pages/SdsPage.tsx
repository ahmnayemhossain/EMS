import * as React from "react";
import { FileSearch, FileText, Search } from "lucide-react";

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
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/format";
import { Textarea } from "@/app/components/ui/textarea";
import { SelectFilter } from "@/components/SelectFilter";

export function SdsPage() {
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>(sdsRecords[0]?.id ?? "");

  const filtered = sdsRecords.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.chemicalName.toLowerCase().includes(q) ||
      s.supplier.toLowerCase().includes(q) ||
      s.fileName.toLowerCase().includes(q)
    );
  });

  const selected = sdsRecords.find((s) => s.id === selectedId) ?? filtered[0];

  const suppliers = new Set(sdsRecords.map((s) => s.supplier)).size;
  const latestRevision = sdsRecords
    .map((s) => s.revisionDate)
    .sort()
    .slice(-1)[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SDS / MSDS repository"
        actions={
          <CreateActionDialog title="Create SDS record">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Chemical name</div>
                <Input placeholder="Chemical name" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Supplier</div>
                <Input placeholder="Supplier" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Language</div>
                <SelectFilter
                  value={undefined}
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
                <Input type="date" />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">File</div>
                <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                  Upload SDS PDF (placeholder)
                </div>
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Notes</div>
                <Textarea placeholder="Optional notes" />
              </div>
            </div>
          </CreateActionDialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KPIStatCard title="SDS records" value={sdsRecords.length} icon={FileText} tone="info" />
        <KPIStatCard title="Suppliers" value={suppliers} tone="neutral" />
        <KPIStatCard title="Latest revision" value={latestRevision ? formatDate(latestRevision) : "—"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
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
                placeholder="Search chemical / supplier…"
              />
            </div>

            <div className="mt-3 space-y-2">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/40 ${
                    s.id === selected?.id ? "bg-muted/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{s.chemicalName}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {s.supplier} • Rev {formatDate(s.revisionDate)}
                      </div>
                    </div>
                    <StatusBadge tone="info">{s.language}</StatusBadge>
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

        <Card className="shadow-xs xl:col-span-2">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {selected ? (
              <div className="space-y-4">
                <div className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold">{selected.chemicalName}</div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        {selected.supplier} • {selected.fileName}
                      </div>
                    </div>
                    <StatusBadge tone="neutral">Revision {formatDate(selected.revisionDate)}</StatusBadge>
                  </div>
                </div>

                <Accordion type="single" collapsible defaultValue="1" className="w-full">
                  {selected.sections.map((sec) => (
                    <AccordionItem key={sec.id} value={sec.id}>
                      <AccordionTrigger>
                        <span className="flex items-center gap-2">
                          <StatusBadge tone="neutral">Section {sec.id}</StatusBadge>
                          <span>{sec.title}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-muted-foreground text-sm">{sec.summary}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Select an SDS record.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
