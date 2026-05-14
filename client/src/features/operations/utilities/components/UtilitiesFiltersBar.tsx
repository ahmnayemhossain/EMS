import { Button } from "@/components/ui/primitives/button";
import { DateRangePickerPlaceholder } from "@/components/forms/DateRangePickerPlaceholder";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";

export function UtilitiesFiltersBar({
  search,
  onSearchChange,
  companyName,
  onClear,
}: {
  search: string;
  onSearchChange: (next: string) => void;
  companyName: string;
  onClear: () => void;
}) {
  return (
    <FilterBar
      left={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[320px]">
            <SearchInput value={search} onChange={onSearchChange} placeholder="Search meter / company..." />
          </div>
          <div className="border-input bg-input-background text-foreground flex h-9 w-full items-center rounded-md border px-3 text-sm sm:w-[220px]">
            <span className="truncate">{companyName}</span>
          </div>
          <DateRangePickerPlaceholder />
        </div>
      }
      onClear={onClear}
      right={<Button variant="outline">Import bills</Button>}
    />
  );
}
