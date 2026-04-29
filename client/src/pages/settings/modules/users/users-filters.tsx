import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import type { UserCompanyOption } from "@/pages/settings/modules/users/users.types";

export function UsersFilters(props: {
  search: string;
  companyId?: string;
  companies: UserCompanyOption[];
  onSearchChange: (value: string) => void;
  onCompanyChange: (value: string | undefined) => void;
  onClear: () => void;
}) {
  return (
    <FilterBar
      left={<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"><div className="w-full sm:w-[360px]"><SearchInput value={props.search} onChange={props.onSearchChange} placeholder="Search users..." /></div><SelectFilter value={props.companyId} onChange={props.onCompanyChange} placeholder="Company" items={props.companies.map((company) => ({ value: company.id, label: company.name }))} /></div>}
      onClear={props.onClear}
    />
  );
}
