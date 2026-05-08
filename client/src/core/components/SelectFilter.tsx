import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/app/components/ui/select";
import { cn } from "@/core/app/components/ui/utils";

export function SelectFilter({
  value,
  onChange,
  placeholder,
  items,
  disabled,
  invalid,
  className,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder: string;
  items: Array<{ value: string; label: string }>;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn("w-full sm:w-[220px]", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
