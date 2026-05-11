import * as React from "react";

import { SectionCard } from "@/components/layout/primitives/SectionCard";

export function PlaceholderModule({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <SectionCard title={title} description={description}>
        {children ? (
          children
        ) : (
          <div className="text-muted-foreground text-sm">
            This module is scaffolded for UI architecture. Wire it to backend when ready.
          </div>
        )}
      </SectionCard>
    </div>
  );
}


