import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SelectFilter } from "@/components/forms/SelectFilter";
import type { UtilityTypeOption } from "@/features/admin/settings/modules/services/uomSettingsApi";

export function EntityFilterBar(props: { search: string; onSearchChange: (value: string) => void; refreshAction: React.ReactNode; onClear: () => void }) {
  return <FilterBar left={<div className="w-full sm:w-[360px]"><SearchInput value={props.search} onChange={props.onSearchChange} placeholder="Search..." /></div>} right={props.refreshAction} onClear={props.onClear} />;
}

export function WiringFilterBar(props: { search: string; utilityTypeFilter: string; statusFilter: string; utilityTypeOptions: UtilityTypeOption[]; onSearchChange: (value: string) => void; onUtilityTypeChange: (value: string) => void; onStatusChange: (value: string) => void; onClear: () => void }) {
  return <FilterBar left={<div className="w-full sm:w-[280px]"><SearchInput value={props.search} onChange={props.onSearchChange} placeholder="Search wiring..." /></div>} right={<><SelectFilter value={props.utilityTypeFilter} onChange={props.onUtilityTypeChange} placeholder="Utility type" className="w-full sm:w-[200px]" items={[{ value: "all", label: "All utility types" }, ...props.utilityTypeOptions.map((item) => ({ value: item.id, label: item.name }))]} /><SelectFilter value={props.statusFilter} onChange={props.onStatusChange} placeholder="Status" className="w-full sm:w-[160px]" items={[{ value: "all", label: "All status" }, { value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} /></>} onClear={props.onClear} className="rounded-lg" />;
}


