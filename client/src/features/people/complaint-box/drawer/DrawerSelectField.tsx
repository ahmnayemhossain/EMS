import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives/select";
import { cn } from "@/components/ui/primitives/utils";

import { DrawerFieldLabel } from "@/features/people/complaint-box/drawer/DrawerFieldLabel";

export function DrawerSelectField({
  label,
  value,
  placeholder,
  required,
  invalid,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  invalid?: boolean;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <DrawerFieldLabel label={label} required={required} />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(invalid && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

