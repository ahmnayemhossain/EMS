import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import { cn } from "@/components/ui/primitives/utils";

import type { AvatarPerson } from "@/components/layout/primitives/AvatarStack";
import { getInitials, hashToHue } from "@/components/layout/primitives/avatar-stack.helpers";

export function AvatarStackList({ shown, extra }: { shown: AvatarPerson[]; extra: number }) {
  return (
    <>
      {shown.map((person, index) => {
        const hue = hashToHue(person.label);
        return (
          <Avatar key={person.id} className={cn("ring-background size-7 ring-2", index > 0 ? "-ml-2" : "")} title={person.label}>
            <AvatarFallback className="text-[10px] font-semibold text-white" style={{ background: `hsl(${hue} 55% 38%)` }}>
              {getInitials(person.label)}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {extra > 0 ? <div className={cn("ring-background -ml-2 grid size-7 place-items-center rounded-full ring-2", "bg-muted text-muted-foreground text-[10px] font-semibold")} title={`${extra} more`}>+{extra}</div> : null}
    </>
  );
}

