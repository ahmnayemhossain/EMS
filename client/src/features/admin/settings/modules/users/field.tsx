import { cn } from "@/components/ui/primitives/utils";

export function Field(props: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", props.className)}>
      <span className="text-xs text-muted-foreground">
        {props.label}
        {props.required ? <span className="ml-1 font-semibold text-destructive">*</span> : null}
      </span>
      {props.children}
      {props.error ? <span className="text-xs font-medium text-destructive">{props.error}</span> : null}
    </div>
  );
}

