import { cn } from "@/app/components/ui/utils";

export function DragPreviewCard({
  width,
  height,
  label,
}: {
  width: number;
  height: number;
  label: React.ReactNode;
}) {
  return (
    <div className={cn("relative rounded-xl border shadow-lg", "bg-rose-200/60 border-rose-400/60", "backdrop-blur-sm")} style={{ width, height }}>
      <div className="grid h-full w-full place-items-center">{label}</div>
    </div>
  );
}
