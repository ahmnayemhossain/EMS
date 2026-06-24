import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { Input } from "@/components/ui/primitives/input";
import type { CompanyOption } from "@/core/app/state/slices/company";

type WasteFiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  companyId?: string;
  setCompanyId: (value: string | undefined) => void;
  companies: CompanyOption[];
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  clear: () => void;
};

export function WasteFilters(props: WasteFiltersProps) {
  return (
    <FilterBar
      left={
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="w-full lg:w-[320px]">
            <SearchInput value={props.search} onChange={props.setSearch} placeholder="Search waste stream / vendor..." />
          </div>
          <SelectFilter
            value={props.companyId}
            onChange={props.setCompanyId}
            placeholder="Company"
            items={props.companies.map((company) => ({ value: company.id, label: company.name }))}
          />
          <div className="grid w-full grid-cols-2 gap-2 lg:w-auto">
            <Input type="date" value={props.dateFrom} onChange={(event) => props.setDateFrom(event.target.value)} />
            <Input type="date" value={props.dateTo} onChange={(event) => props.setDateTo(event.target.value)} />
          </div>
        </div>
      }
      onClear={props.clear}
    />
  );
}
