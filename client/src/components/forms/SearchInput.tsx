import * as React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/primitives/input";

export function SearchInput({
  value,
  onChange,
  placeholder = "SearchÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full">
      <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}


