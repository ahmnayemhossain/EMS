export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="max-w-[65%] break-words text-right text-sm font-medium">{children}</div>
    </div>
  );
}
