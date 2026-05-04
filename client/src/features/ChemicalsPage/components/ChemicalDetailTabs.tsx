import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/app/components/ui/tabs";
import { StatusBadge } from "@/core/components/StatusBadge";
import type { Chemical } from "@/core/types/ems";

export function ChemicalDetailTabs({ chemical }: { chemical: Chemical }) {
  return (
    <Tabs defaultValue="safety">
      <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-xl border p-1">
        <TabsTrigger value="safety">Safety</TabsTrigger>
        <TabsTrigger value="storage">Storage</TabsTrigger>
        <TabsTrigger value="ledger">Ledger</TabsTrigger>
      </TabsList>
      <TabsContent value="safety" className="mt-3 space-y-3">
        <ChemicalDetailBlock title="Hazard pictograms" body="Placeholder for GHS pictograms mapped by hazard class." />
        <div className="rounded-lg border p-3"><div className="text-muted-foreground text-xs">PPE</div><div className="mt-2 flex flex-wrap gap-2">{chemical.ppe.map((ppe) => <StatusBadge key={ppe} tone="info">{ppe}</StatusBadge>)}</div></div>
      </TabsContent>
      <TabsContent value="storage" className="mt-3 space-y-3"><ChemicalDetailBlock title="Storage notes" body="Placeholder for segregation and compatibility checks." /></TabsContent>
      <TabsContent value="ledger" className="mt-3 space-y-3"><ChemicalDetailBlock title="Movement ledger" body="Placeholder for issue/receive logs." /></TabsContent>
    </Tabs>
  );
}

function ChemicalDetailBlock({ title, body }: { title: string; body: string }) {
  return <div className="rounded-lg border p-3"><div className="text-muted-foreground text-xs">{title}</div><div className="text-muted-foreground mt-1 text-sm">{body}</div></div>;
}
