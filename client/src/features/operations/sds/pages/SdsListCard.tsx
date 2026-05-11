import { FileSearch, FileText, Search } from "lucide-react";

import { Input } from "@/components/ui/primitives/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { KPIStatCard } from "@/components/layout/primitives/KPIStatCard";
import { PageKpiGrid } from "@/components/layout/primitives/PageKpiGrid";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { SDSRecord } from "@/core/types/models/ems";

type SdsListCardProps = { suppliers: number; latestRevision: string; search: string; setSearch: (value: string) => void; filtered: SDSRecord[]; selectedId?: string; openRecord: (id: string) => void; };

export function SdsListCard(props: SdsListCardProps) {
  return <><PageKpiGrid columnsClassName="sm:grid-cols-2 md:grid-cols-3"><KPIStatCard title="SDS records" value={props.filtered.length} icon={FileText} tone="info" /><KPIStatCard title="Suppliers" value={props.suppliers} tone="neutral" /><KPIStatCard title="Latest revision" value={props.latestRevision} /></PageKpiGrid><Card className="shadow-xs"><CardHeader className="pb-2"><CardTitle>SDS list</CardTitle></CardHeader><CardContent className="pt-0"><div className="relative"><Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" /><Input className="pl-9" value={props.search} onChange={(event) => props.setSearch(event.target.value)} placeholder="Search chemical / supplier..." /></div><div className="mt-3 space-y-2">{props.filtered.map((record) => <button key={record.id} onClick={() => props.openRecord(record.id)} className={`w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/40 ${record.id === props.selectedId ? "bg-muted/40" : ""}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="truncate text-sm font-medium">{record.chemicalName}</div><div className="text-muted-foreground mt-1 text-xs">{record.supplier} - Rev {record.revisionDate}</div><div className="text-muted-foreground mt-1 truncate text-xs">{record.fileName}</div></div><div className="flex items-center gap-2"><StatusBadge tone="info">{record.language}</StatusBadge><StatusBadge tone="neutral">Preview</StatusBadge></div></div></button>)}{!props.filtered.length ? <div className="text-muted-foreground grid place-items-center gap-2 rounded-xl border p-8 text-sm"><FileSearch className="size-5" />No SDS found</div> : null}</div></CardContent></Card></>;
}

