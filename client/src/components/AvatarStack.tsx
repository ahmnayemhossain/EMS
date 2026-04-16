import * as React from "react";

import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/components/ui/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/app/components/ui/hover-card";

type AvatarPerson = {
  id: string;
  label: string;
};

function hashToHue(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}

function getInitials(label: string) {
  const namePart = label.split("(")[0]?.trim() || label.trim();
  const parts = namePart.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return (first + (second || "")).toUpperCase();
}

export function AvatarStack({
  people,
  maxVisible = 4,
  className,
}: {
  people: AvatarPerson[];
  maxVisible?: number; // total circles including the +N badge
  className?: string;
}) {
  const uniq = React.useMemo(() => {
    const seen = new Set<string>();
    const out: AvatarPerson[] = [];
    for (const p of people) {
      const key = p.id || p.label;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: key, label: p.label });
    }
    return out;
  }, [people]);

  if (!uniq.length) return null;

  const max = Math.max(2, maxVisible);
  const showCount = Math.min(uniq.length, max - 1);
  const shown = uniq.slice(0, showCount);
  const extra = Math.max(0, uniq.length - showCount);

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div className={cn("flex items-center", className)} aria-label="Working users">
          {shown.map((p, idx) => {
            const hue = hashToHue(p.label);
            return (
              <Avatar
                key={p.id}
                className={cn(
                  "ring-background size-7 ring-2",
                  idx > 0 ? "-ml-2" : "",
                )}
                title={p.label}
              >
                <AvatarFallback
                  className="text-[10px] font-semibold text-white"
                  style={{
                    background: `hsl(${hue} 55% 38%)`,
                  }}
                >
                  {getInitials(p.label)}
                </AvatarFallback>
              </Avatar>
            );
          })}
          {extra > 0 ? (
            <div
              className={cn(
                "ring-background -ml-2 grid size-7 place-items-center rounded-full ring-2",
                "bg-muted text-muted-foreground text-[10px] font-semibold",
              )}
              title={`${extra} more`}
            >
              +{extra}
            </div>
          ) : null}
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

