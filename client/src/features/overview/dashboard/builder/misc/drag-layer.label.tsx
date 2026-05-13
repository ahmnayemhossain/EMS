export function DragLayerLabel({ title }: { title: string }) {
  return (
    <>
      <div className="absolute right-2 top-2 text-foreground/70 text-xs">Ãƒâ€”</div>
      <div className="text-foreground/80 text-sm font-semibold">{title}</div>
    </>
  );
}
