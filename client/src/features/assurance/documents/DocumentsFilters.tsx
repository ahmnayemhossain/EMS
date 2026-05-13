import { DateRangePickerPlaceholder } from "@/components/forms/DateRangePickerPlaceholder";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { facilities } from "@/core/data/catalog/mock";

export function DocumentsFilters(props: { search: string; setSearch: (value: string) => void; facilityId?: string; setFacilityId: (value: string | undefined) => void; clear: () => void; }) {
  return <FilterBar left={<div className="flex flex-col gap-2 sm:flex-row sm:items-center"><div className="w-full sm:w-[320px]"><SearchInput value={props.search} onChange={props.setSearch} placeholder="Search documentsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦" /></div><SelectFilter value={props.facilityId} onChange={props.setFacilityId} placeholder="Company" items={facilities.map((facility) => ({ value: facility.id, label: facility.name }))} /><DateRangePickerPlaceholder label="Expiry" /></div>} onClear={props.clear} />;
}

