import * as React from "react";

export function DetailCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border p-3">{children}</div>;
}
