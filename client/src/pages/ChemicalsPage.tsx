import * as React from "react";
import { Link } from "react-router";
import { AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";

import { chemicals, facilities, getFacilityName, sdsRecords } from "@/data/mock";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/components/ui/utils";
import { CreateActionDialog } from "@/components/CreateActionDialog";
import { DetailPanel } from "@/components/DetailPanel";
import { KPIStatCard } from "@/components/KPIStatCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatNumber } from "@/utils/format";
import type { Chemical, HazardClass } from "@/types/ems";
import { SelectFilter } from "@/components/SelectFilter";

function daysUntil(dateIso?: string) {
  if (!dateIso) return undefined;
  const now = new Date("2026-04-09T00:00:00+06:00").getTime();
  const d = new Date(dateIso).getTime();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

const hazardLabels: Record<HazardClass, string> = {
  corrosive: "Corrosive",
  flammable: "Flammable",
  toxic: "Toxic",
  oxidizer: "Oxidizer",
  irritant: "Irritant",
  environmental_hazard: "Environmental hazard",
  compressed_gas: "Compressed gas",
};

export function ChemicalsPage() {
  const [search, setSearch] = React.useState("");
  const [factoryId, setFactoryId] = React.useState<string | undefined>();
  const [hazard, setHazard] = React.useState<string | undefined>();
  const [approval, setApproval] = React.useState<string | undefined>();
  const [expiryFrom, setExpiryFrom] = React.useState<string>("");
  const [expiryTo, setExpiryTo] = React.useState<string>("");
  const [selected, setSelected] = React.useState<Chemical | null>(null);

  const hazardOptions = Object.entries(hazardLabels).map(([value, label]) => ({
    value,
    label,
  }));
  const approvalOptions = [
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "restricted", label: "Restricted" },
  ];

  const expiryFromTs = expiryFrom ? new Date(expiryFrom).getTime() : undefined;
  const expiryToTs = expiryTo ? new Date(expiryTo).getTime() : undefined;

  const rows = chemicals
    .filter((c) => (factoryId ? c.facilityId === factoryId : true))
    .filter((c) =>
      hazard ? c.hazardClasses.includes(hazard as HazardClass) : true,
    )
    .filter((c) =>
      approval ? c.approvalStatus === (approval as Chemical["approvalStatus"]) : true,
    )
    .filter((c) => {
      if (!expiryFromTs && !expiryToTs) return true;
      if (!c.expiryDate) return false;
      const ts = new Date(c.expiryDate).getTime();
      if (expiryFromTs && ts < expiryFromTs) return false;
      if (expiryToTs && ts > expiryToTs) return false;
      return true;
    })
    .filter((c) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.supplier.toLowerCase().includes(q) ||
        c.storageArea.toLowerCase().includes(q) ||
        getFacilityName(c.facilityId).toLowerCase().includes(q)
      );
    });

  const total = rows.length;
  const restricted = rows.filter((c) => c.approvalStatus === "restricted").length;
  const missingSds = rows.filter((c) => !c.sdsId).length;
  const nearExpiry = rows.filter((c) => {
    const d = daysUntil(c.expiryDate);
    return typeof d === "number" && d >= 0 && d <= 60;
  }).length;
  const hazardousStock = rows.filter((c) => c.hazardClasses.length >= 2).length;
  const nonApproved = rows.filter((c) => c.approvalStatus !== "approved").length;

  const sdsById = new Map(sdsRecords.map((s) => [s.id, s]));

  const underlineInput =
    "h-8 rounded-none border-0 border-b border-border bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 focus-visible:border-primary";
  const underlineSelect =
    "h-8 w-full rounded-none border-0 border-b border-border bg-transparent px-0 text-xs shadow-none focus:ring-0 focus:ring-offset-0";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chemical inventory"
        actions={
          <CreateActionDialog title="Create chemical">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Factory</div>
                <SelectFilter
                  value={factoryId}
                  onChange={setFactoryId}
                  placeholder="Select factory"
                  items={facilities.map((f) => ({ value: f.id, label: f.name }))}
                />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Approval</div>
                <SelectFilter
                  value={approval}
                  onChange={setApproval}
                  placeholder="Approval status"
                  items={approvalOptions}
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Chemical name</div>
                <Input placeholder="e.g. Hydrogen Peroxide (50%)" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Supplier</div>
                <Input placeholder="Supplier name" />
              </div>
              <div className="grid gap-1.5">
                <div className="text-muted-foreground text-xs">Storage area</div>
                <Input placeholder="e.g. Oxidizer store" />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <div className="text-muted-foreground text-xs">Notes</div>
                <Textarea placeholder="Optional notes" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                <div className="text-sm font-medium">Approval workflow</div>
                <Button type="button" variant="outline" size="sm">
                  <ShieldCheck className="mr-2 size-4" />
                  Open
                </Button>
              </div>
            </div>
          </CreateActionDialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KPIStatCard title="Total chemicals" value={total} tone="info" />
        <KPIStatCard
          title="Restricted chemicals"
          value={restricted}
          helper="Requires substitution / controls"
          tone={restricted > 0 ? "critical" : "compliant"}
        />
        <KPIStatCard title="Missing SDS" value={missingSds} helper="Attach SDS" tone={missingSds > 0 ? "warning" : "compliant"} />
        <KPIStatCard title="Near expiry" value={nearExpiry} helper="Within 60 days" tone={nearExpiry > 0 ? "warning" : "compliant"} />
        <KPIStatCard
          title="Hazardous stock"
          value={hazardousStock}
          helper="Multiple hazard classes"
          tone={hazardousStock > 0 ? "info" : "neutral"}
        />
        <KPIStatCard title="Non-approved" value={nonApproved} helper="Pending or restricted" tone={nonApproved > 0 ? "warning" : "compliant"} />
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[360px]">Chemical</TableHead>
              <TableHead className="min-w-[220px]">Factory</TableHead>
              <TableHead className="min-w-[240px]">Hazard</TableHead>
              <TableHead className="min-w-[140px]">Approval</TableHead>
              <TableHead className="min-w-[140px] text-right">Stock</TableHead>
              <TableHead className="min-w-[200px] text-right">Expiry</TableHead>
            </TableRow>

            <TableRow className="bg-muted/20">
              <TableHead className="py-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(underlineInput, "placeholder:text-muted-foreground/70")}
                  placeholder="Search…"
                />
              </TableHead>

              <TableHead className="py-2">
                <Select value={factoryId} onValueChange={(v) => setFactoryId(v)}>
                  <SelectTrigger className={underlineSelect}>
                    <SelectValue placeholder="Factory" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead className="py-2">
                <Select value={hazard} onValueChange={(v) => setHazard(v)}>
                  <SelectTrigger className={underlineSelect}>
                    <SelectValue placeholder="Hazard" />
                  </SelectTrigger>
                  <SelectContent>
                    {hazardOptions.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead className="py-2">
                <Select value={approval} onValueChange={(v) => setApproval(v)}>
                  <SelectTrigger className={underlineSelect}>
                    <SelectValue placeholder="Approval" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvalOptions.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead className="py-2 text-right">
                <div className="text-muted-foreground text-[11px] font-medium">—</div>
              </TableHead>

              <TableHead className="py-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={expiryFrom}
                    onChange={(e) => setExpiryFrom(e.target.value)}
                    className={underlineInput}
                  />
                  <Input
                    type="date"
                    value={expiryTo}
                    onChange={(e) => setExpiryTo(e.target.value)}
                    className={underlineInput}
                  />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((c) => {
              const d = daysUntil(c.expiryDate);
              const expiryTone =
                typeof d === "number" && d < 0
                  ? "critical"
                  : typeof d === "number" && d <= 60
                    ? "warning"
                    : "neutral";

              return (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(c)}
                >
                  <TableCell className="min-w-[360px]">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.name}</div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {c.supplier} • {c.storageArea}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[220px]">
                    <div className="text-sm">{getFacilityName(c.facilityId)}</div>
                  </TableCell>

                  <TableCell className="min-w-[240px]">
                    <div className="flex flex-wrap gap-1">
                      {c.hazardClasses.slice(0, 2).map((h) => (
                        <StatusBadge key={h} tone="info">
                          {hazardLabels[h]}
                        </StatusBadge>
                      ))}
                      {c.hazardClasses.length > 2 ? (
                        <StatusBadge tone="neutral">+{c.hazardClasses.length - 2}</StatusBadge>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[140px]">
                    <StatusBadge
                      tone={
                        c.approvalStatus === "approved"
                          ? "compliant"
                          : c.approvalStatus === "pending"
                            ? "warning"
                            : "critical"
                      }
                    >
                      {c.approvalStatus}
                    </StatusBadge>
                  </TableCell>

                  <TableCell className="min-w-[140px] text-right font-medium tabular-nums">
                    {formatNumber(c.stockKg)} kg
                  </TableCell>

                  <TableCell className="min-w-[200px]">
                    <div className="flex justify-end">
                      <StatusBadge tone={expiryTone}>
                        {c.expiryDate ? formatDate(c.expiryDate) : "—"}
                      </StatusBadge>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-muted-foreground text-xs">{rows.length} rows</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearch("");
            setFactoryId(undefined);
            setHazard(undefined);
            setApproval(undefined);
            setExpiryFrom("");
            setExpiryTo("");
          }}
        >
          Clear filters
        </Button>
      </div>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? selected.name : "Chemical"}
        description={
          selected ? `${getFacilityName(selected.facilityId)} • ${selected.storageArea}` : undefined
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Approval</div>
                <div className="mt-1">
                  <StatusBadge
                    tone={
                      selected.approvalStatus === "approved"
                        ? "compliant"
                        : selected.approvalStatus === "pending"
                          ? "warning"
                          : "critical"
                    }
                  >
                    {selected.approvalStatus}
                  </StatusBadge>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Stock</div>
                <div className="mt-1 text-sm font-semibold">
                  {formatNumber(selected.stockKg)} kg
                </div>
                {typeof selected.minStockKg === "number" ? (
                  <div className="text-muted-foreground mt-1 text-xs">
                    Min: {formatNumber(selected.minStockKg)} kg
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-muted-foreground text-xs">SDS link</div>
                  <div className="mt-1 text-sm font-medium">
                    {selected.sdsId
                      ? sdsById.get(selected.sdsId)?.fileName ?? "SDS record"
                      : "No SDS linked"}
                  </div>
                </div>
                {selected.sdsId ? (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/sds">
                      Open SDS
                      <ExternalLink className="ml-2 size-4" />
                    </Link>
                  </Button>
                ) : (
                  <StatusBadge tone="warning">
                    <AlertTriangle className="size-3" />
                    Missing SDS
                  </StatusBadge>
                )}
              </div>
            </div>

            <Tabs defaultValue="safety">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="safety">Safety</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
                <TabsTrigger value="ledger">Ledger</TabsTrigger>
              </TabsList>

              <TabsContent value="safety" className="mt-3 space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground text-xs">Hazard pictograms</div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Placeholder for GHS pictograms mapped by hazard class.
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground text-xs">PPE</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.ppe.map((p) => (
                      <StatusBadge key={p} tone="info">
                        {p}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="storage" className="mt-3 space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground text-xs">Storage instruction</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {selected.storageInstructions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground text-xs">Compatibility warning</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {selected.compatibilityWarnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                  {selected.linkedWasteStream ? (
                    <div className="text-muted-foreground mt-2 text-xs">
                      Linked waste stream: {selected.linkedWasteStream}
                    </div>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="ledger" className="mt-3 space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground text-xs">Stock ledger</div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Placeholder for in/out ledger, batch traceability, and consumption per line.
                  </div>
                </div>
                {selected.batches?.length ? (
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-xs">Batches</div>
                    <div className="mt-2 space-y-2 text-sm">
                      {selected.batches.map((b) => (
                        <div
                          key={b.batchNo}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">{b.batchNo}</div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              Received {formatDate(b.receivedAt)}
                            </div>
                          </div>
                          <div className="shrink-0 font-medium tabular-nums">
                            {formatNumber(b.qtyKg)} kg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}
