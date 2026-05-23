import * as React from 'react';

import { cn } from '@/components/ui/primitives/utils';

export function WidgetShell({
  enabled,
  dragHandleRef,
  title,
  children,
}: {
  enabled: boolean;
  dragHandleRef: (node: HTMLDivElement | null) => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'group relative h-full min-w-0',
        enabled
          ? 'overflow-hidden rounded-[18px] border border-border/20 bg-card shadow-sm'
          : undefined,
      )}
    >
      {children}

      {enabled ? (
        <div
          ref={dragHandleRef}
          role="button"
          tabIndex={0}
          aria-label="Drag widget"
          className={cn(
            'absolute inset-x-2 top-2 z-10 h-8 rounded-xl',
            'cursor-grab active:cursor-grabbing touch-none transition',
            'bg-background/0 opacity-0 group-hover:opacity-100',
            'hover:bg-background/10',
          )}
          title={title ? `Drag • ${title}` : 'Drag'}
        >
          <span className="sr-only">Drag widget</span>
        </div>
      ) : null}
    </div>
  );
}
