import * as React from "react";

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-xl border bg-card/60 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="text-foreground text-sm font-semibold tracking-tight">{title}</div>
      {children}
    </section>
  );
}

export function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-muted/20 px-3 py-3">
      <div className="text-muted-foreground text-[11px] uppercase tracking-[0.08em]">{label}</div>
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
