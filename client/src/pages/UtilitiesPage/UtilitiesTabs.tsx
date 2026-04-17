import { TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { formatUtilityType } from "@/utils/format";
import type { UtilityType } from "@/types/ems";

export function UtilitiesTabStrip({
  types,
}: {
  types: UtilityType[];
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <TabsList className="w-max flex-nowrap justify-start">
        {types.map((t) => (
          <TabsTrigger key={t} value={t} className="flex-none">
            {formatUtilityType(t)}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
