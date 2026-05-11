import { TabsList, TabsTrigger } from "@/components/ui/primitives/tabs";

export type AuditsModuleTab = "audits" | "certification" | "legal" | "testing";

export function AuditModuleTabs({
  auditsCount,
}: {
  auditsCount?: number;
}) {
  return (
    <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:grid-cols-4">
      <TabsTrigger value="audits" className="min-w-0">
        <span className="truncate">
          Audits{" "}
          {typeof auditsCount === "number" ? (
            <span className="text-muted-foreground ml-1 text-xs">({auditsCount})</span>
          ) : null}
        </span>
      </TabsTrigger>
      <TabsTrigger value="certification" className="min-w-0">
        <span className="truncate">Certification</span>
      </TabsTrigger>
      <TabsTrigger value="legal" className="min-w-0">
        <span className="truncate">Legal licence</span>
      </TabsTrigger>
      <TabsTrigger value="testing" className="min-w-0">
        <span className="truncate">Testing</span>
      </TabsTrigger>
    </TabsList>
  );
}


