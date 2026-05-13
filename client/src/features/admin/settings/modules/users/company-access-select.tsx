import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
import { cn } from "@/components/ui/primitives/utils";
import type { UserCompanyOption } from "@/features/admin/settings/modules/users/users.types";

export function CompanyAccessSelect(props: {
  value: string[];
  companies: UserCompanyOption[];
  invalid?: boolean;
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const label = buildLabel(props.companies, props.value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-invalid={props.invalid || undefined} className={cn("h-10 w-full justify-between px-3 text-left font-normal", props.invalid && "border-destructive ring-[3px] ring-destructive/20")}>
          <span className={cn("truncate", !props.value.length && "text-muted-foreground")}>{label}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1">
        <div className="max-h-64 overflow-y-auto">
          {props.companies.map((company) => <CompanyOptionRow key={company.id} company={company} value={props.value} onChange={props.onChange} />)}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function buildLabel(companies: UserCompanyOption[], value: string[]) {
  const selected = companies.filter((company) => value.includes(company.id));
  if (!selected.length) return "Select company access";
  return selected.length === 1 ? selected[0].name : `${selected[0].name} +${selected.length - 1}`;
}

function CompanyOptionRow(props: { company: UserCompanyOption; value: string[]; onChange: (ids: string[]) => void }) {
  const checked = props.value.includes(props.company.id);
  const next = checked ? props.value.filter((id) => id !== props.company.id) : Array.from(new Set([...props.value, props.company.id]));
  return (
    <button type="button" className={cn("flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted", checked && "bg-muted")} onClick={() => props.onChange(next)}>
      <span className={cn("grid size-4 shrink-0 place-items-center rounded border", checked ? "border-primary bg-primary text-primary-foreground" : "border-input")}>{checked ? <Check className="size-3" /> : null}</span>
      <span className="truncate font-medium">{props.company.name}</span>
    </button>
  );
}


