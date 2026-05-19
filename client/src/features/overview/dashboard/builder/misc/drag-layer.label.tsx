export function DragLayerLabel({ title }: { title: string }) {
  return (
    <>
      <div className="text-foreground/50 absolute right-2 top-2 text-xs">×</div>
      <div className="text-foreground/80 text-sm font-semibold">{title}</div>
    </>
  );
}
