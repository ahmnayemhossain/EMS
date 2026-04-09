import * as React from "react";

export function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  if (!actions) return <h1 className="sr-only">{title}</h1>;

  return (
    <div className="flex items-center justify-end gap-2">
      <h1 className="sr-only">{title}</h1>
      {actions}
    </div>
  );
}
