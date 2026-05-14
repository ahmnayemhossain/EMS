import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { utilityTypes } from "@/features/operations/utilities/config/constants";
import { formatUtilityType } from "@/core/utils/format";

export function ReportFilters(props: {
  search: string;
  typeFilter: string;
  companyName: string;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <FilterBar
      left={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[320px]">
            <SearchInput
              value={props.search}
              onChange={props.onSearchChange}
              placeholder="Search meter, source, remarks..."
            />
          </div>
          <SelectFilter
            value={props.typeFilter}
            onChange={props.onTypeFilterChange}
            placeholder="Utility type"
            items={[
              { value: "all", label: "All utility types" },
              ...utilityTypes.map((type) => ({ value: type, label: formatUtilityType(type) })),
            ]}
            className="sm:w-[220px]"
          />
        </div>
      }
      right={<div className="text-muted-foreground text-sm">{props.companyName}</div>}
      onClear={props.onClear}
    />
  );
}
