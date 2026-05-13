export function QuickChip(props: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        props.active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      ].join(" ")}
    >
      {props.label}
    </button>
  );
}
