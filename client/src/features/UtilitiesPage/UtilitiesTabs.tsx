import { TabsList, TabsTrigger } from "@/core/app/components/ui/tabs";
import { formatUtilityType } from "@/core/utils/format";
import type { UtilityType } from "@/core/types/ems";

export function UtilitiesTabStrip({
  types,
}: {
  types: UtilityType[];
}) {
  return (
    <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-3 gap-1 rounded-xl border p-1 sm:grid-cols-6">
      {types.map((t) => (
        <TabsTrigger key={t} value={t} className="min-w-0 px-2 text-xs sm:px-3 sm:text-sm">
          <span className="truncate">{formatUtilityType(t)}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
