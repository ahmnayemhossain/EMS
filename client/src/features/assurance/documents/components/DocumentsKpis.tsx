type DocumentsKpisProps = {
  total: number;
  expiring: number;
  expired: number;
};

export function DocumentsKpis(props: DocumentsKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <KpiCard label="Documents" value={props.total} />
      <KpiCard label="Expiring" value={props.expiring} />
      <KpiCard label="Expired" value={props.expired} />
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
