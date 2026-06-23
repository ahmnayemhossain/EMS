import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { Chemical } from "@/core/types/models/ems";

export function ChemicalDetailTabs({ chemical }: { chemical: Chemical }) {
  const hazardItems = chemical.hazardClasses.map((hazard) => hazard.replace(/_/g, " "));
  const storageInstructions = chemical.storageInstructions.filter(Boolean);
  const compatibilityWarnings = chemical.compatibilityWarnings.filter(Boolean);
  const batchRows = chemical.batches ?? [];

  return (
    <Tabs defaultValue="safety">
      <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-xl border p-1">
        <TabsTrigger value="safety">Safety</TabsTrigger>
        <TabsTrigger value="storage">Storage</TabsTrigger>
        <TabsTrigger value="ledger">Ledger</TabsTrigger>
      </TabsList>

      <TabsContent value="safety" className="mt-3 space-y-3">
        <ChemicalTagBlock
          title="Hazard classes"
          values={hazardItems}
          emptyLabel="No hazard classes assigned"
          tone="warning"
        />
        <ChemicalTagBlock title="PPE" values={chemical.ppe} emptyLabel="No PPE assigned" tone="info" />
      </TabsContent>

      <TabsContent value="storage" className="mt-3 space-y-3">
        <ChemicalDetailBlock title="Storage area" body={chemical.storageArea} />
        <ChemicalTagBlock
          title="Storage instructions"
          values={storageInstructions}
          emptyLabel="No storage instructions added"
          tone="neutral"
        />
        <ChemicalTagBlock
          title="Compatibility warnings"
          values={compatibilityWarnings}
          emptyLabel="No compatibility warnings added"
          tone="warning"
        />
      </TabsContent>

      <TabsContent value="ledger" className="mt-3 space-y-3">
        <ChemicalDetailBlock title="Linked waste stream" body={chemical.linkedWasteStream || "Not linked"} />
        <ChemicalDetailBlock
          title="Minimum stock"
          body={typeof chemical.minStockKg === "number" ? `${chemical.minStockKg} kg` : "Not set"}
        />
        <div className="rounded-lg border p-3">
          <div className="text-muted-foreground text-xs">Batches</div>
          <div className="mt-2 space-y-2">
            {batchRows.length ? (
              batchRows.map((batch) => (
                <div key={`${batch.batchNo}-${batch.receivedAt}`} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{batch.batchNo}</div>
                    <div className="text-muted-foreground text-xs">{batch.receivedAt}</div>
                  </div>
                  <StatusBadge tone="info">{batch.qtyKg} kg</StatusBadge>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">No batch history added.</div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function ChemicalDetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-muted-foreground text-xs">{title}</div>
      <div className="mt-1 text-sm">{body}</div>
    </div>
  );
}

function ChemicalTagBlock({
  title,
  values,
  emptyLabel,
  tone,
}: {
  title: string;
  values: string[];
  emptyLabel: string;
  tone: "info" | "warning" | "neutral";
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-muted-foreground text-xs">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.length ? (
          values.map((value) => (
            <StatusBadge key={value} tone={tone}>
              {value}
            </StatusBadge>
          ))
        ) : (
          <div className="text-muted-foreground text-sm">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}
