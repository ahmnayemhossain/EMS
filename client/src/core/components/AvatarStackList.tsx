import { Avatar, AvatarFallback } from "@/core/app/components/ui/avatar";
import { cn } from "@/core/app/components/ui/utils";

import type { AvatarPerson } from "@/core/components/AvatarStack";
import { getInitials, hashToHue } from "@/core/components/avatar-stack.helpers";

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
