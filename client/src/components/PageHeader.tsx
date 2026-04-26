import * as React from "react";

export function PageHeader({
  title,
  actions,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  if (!title && !actions) return null;

  return (
    <div
      className={[
        "flex flex-wrap items-center gap-3",
        title ? "justify-between" : "justify-end",
      ].join(" ")}
    >
      {title ? <h1 className="text-lg font-semibold leading-none sm:text-xl">{title}</h1> : null}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
