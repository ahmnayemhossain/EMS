import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { Button } from "@/core/app/components/ui/button";
import { Input } from "@/core/app/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/app/components/ui/popover";
import { cn } from "@/core/app/components/ui/utils";
import { AvatarInitials } from "@/core/settings/modules/users/avatar-initials";
import type { UserEmployeeOption } from "@/core/settings/modules/usersApi";

export function EmployeeSelect(props: {
  value?: string;
  employees: UserEmployeeOption[];
  invalid?: boolean;
  onChange: (employeeDbId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const selectedEmployee = props.employees.find((employee) => employee.id === props.value);
  const options = filterEmployees(props.employees, search).slice(0, 10);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-invalid={props.invalid || undefined} className={cn("h-10 w-full justify-between px-3 text-left font-normal", props.invalid && "border-destructive ring-[3px] ring-destructive/20")}>
          {selectedEmployee ? <SelectedEmployee employee={selectedEmployee} /> : <span className="text-muted-foreground">Select employee</span>}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <SearchBox value={search} onChange={setSearch} />
        <div className="max-h-64 overflow-y-auto p-1">
          {options.map((employee) => <EmployeeOption key={employee.id} employee={employee} value={props.value} onSelect={(id) => { props.onChange(id); setOpen(false); setSearch(""); }} />)}
          {!options.length ? <div className="px-3 py-6 text-center text-sm text-muted-foreground">No employee found.</div> : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function filterEmployees(employees: UserEmployeeOption[], search: string) {
  const query = search.trim().toLowerCase();
  return employees.filter((employee) => !query || `${employee.employeeId} ${employee.name} ${employee.email} ${employee.companyName ?? ""}`.toLowerCase().includes(query));
}

function SearchBox(props: { value: string; onChange: (value: string) => void }) {
  return <div className="border-b p-2"><div className="relative"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={props.value} onChange={(event) => props.onChange(event.target.value)} placeholder="Search employee ID or name" className="pl-8" /></div></div>;
}

function SelectedEmployee({ employee }: { employee: UserEmployeeOption }) {
  return <span className="flex min-w-0 items-center gap-2"><AvatarInitials label={employee.name} /><span className="min-w-0"><span className="block truncate text-sm font-medium">{employee.name}</span><span className="block truncate text-xs text-muted-foreground">ID {employee.employeeId} - {employee.companyName || "No company"}</span></span></span>;
}

function EmployeeOption(props: { employee: UserEmployeeOption; value?: string; onSelect: (id: string) => void }) {
  return (
    <button type="button" className={cn("flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-muted", props.employee.id === props.value && "bg-muted")} onClick={() => props.onSelect(props.employee.id)}>
      <AvatarInitials label={props.employee.name} />
      <span className="min-w-0 flex-1"><span className="block truncate font-medium">{props.employee.name}</span><span className="block truncate text-xs text-muted-foreground">ID {props.employee.employeeId} - {props.employee.companyName || "No company"}</span></span>
      <Check className={cn("size-4 shrink-0", props.employee.id === props.value ? "opacity-100" : "opacity-0")} />
    </button>
  );
}
