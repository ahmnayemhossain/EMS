export function AvatarInitials({ label }: { label?: string }) {
  const initials = String(label || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials || "?"}
    </div>
  );
}
