export type DragItem<TId extends string> = { id: TId; index: number };

export type DashboardGridItemProps<TId extends string> = {
  dndType: string;
  id: TId;
  index: number;
  enabled: boolean;
  gridRef: React.RefObject<HTMLElement | null>;
  span: number;
  minSpan?: number;
  maxSpan?: number;
  onMove: (from: TId, to: TId) => void;
  onSpanChange: (span: number) => void;
  children: React.ReactNode;
};
