import * as React from "react";

import { cn } from "@/app/components/ui/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/app/components/ui/hover-card";
import { AvatarStackList } from "@/components/AvatarStackList";
import { getUniquePeople } from "@/components/avatar-stack.helpers";

export type AvatarPerson = {
  id: string;
  label: string;
};

export function AvatarStack({
  people,
  maxVisible = 4,
  className,
}: {
  people: AvatarPerson[];
  maxVisible?: number; // total circles including the +N badge
  className?: string;
}) {
  const uniq = React.useMemo(() => getUniquePeople(people), [people]);
  if (!uniq.length) return null;
  const max = Math.max(2, maxVisible);
  const showCount = Math.min(uniq.length, max - 1);
  const shown = uniq.slice(0, showCount);
  const extra = Math.max(0, uniq.length - showCount);

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div className={cn("flex items-center", className)} aria-label="Working users">
          <AvatarStackList shown={shown} extra={extra} />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-56 p-3">
        <div className="text-sm font-semibold">Working on this</div>
        <div className="mt-2 grid gap-1">
          {uniq.map((p) => (
            <div key={p.id} className="text-muted-foreground text-xs">
              {p.label}
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
