export function DrawerFieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="text-muted-foreground text-xs">
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </div>
  );
}
