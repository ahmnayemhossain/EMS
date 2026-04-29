import * as React from "react";

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 rounded-lg border p-3">
      <div className="text-sm font-semibold">{title}</div>
      {children}
    </section>
  );
}

export function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="text-muted-foreground text-xs">
      {children}
      {required ? <span className="ml-0.5 text-destructive">*</span> : null}
    </div>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <div className="text-destructive text-xs">{children}</div>;
}
