import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { cn } from "@/app/components/ui/utils";

export function SelectFilter({
  value,
  onChange,
  placeholder,
  items,
  invalid,
  className,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder: string;
  items: Array<{ value: string; label: string }>;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-invalid={invalid || undefined} className={cn("w-full sm:w-[220px]", className)}>
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
