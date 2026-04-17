import { Button } from "@/app/components/ui/button";
import { DateRangePickerPlaceholder } from "@/components/DateRangePickerPlaceholder";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import type { Facility } from "@/types/ems";

export function UtilitiesFiltersBar({
  search,
  onSearchChange,
  facilityId,
  onFacilityIdChange,
  facilities,
  onClear,
}: {
  search: string;
  onSearchChange: (next: string) => void;
  facilityId?: string;
  onFacilityIdChange: (next: string | undefined) => void;
  facilities: Facility[];
  onClear: () => void;
}) {
  return (
    <FilterBar
      left={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[320px]">
            <SearchInput
              value={search}
              onChange={onSearchChange}
              placeholder="Search meter / factory…"
            />
          </div>
          <SelectFilter
            value={facilityId}
            onChange={onFacilityIdChange}
            placeholder="Factory"
            items={facilities.map((f) => ({ value: f.id, label: f.name }))}
          />
          <DateRangePickerPlaceholder />
        </div>
      }
      onClear={onClear}
      right={<Button variant="outline">Import bills</Button>}
    />
  );
}

