import { Button } from "@/components/ui/primitives/button";
import { Switch } from "@/components/ui/primitives/switch";

type DashboardActionsProps = {
  customize: boolean;
  isMobile: boolean;
  setCustomize: (value: boolean) => void;
  resetLayout: () => void;
};

export function DashboardActions(props: DashboardActionsProps) {
  return <div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1"><span className="text-muted-foreground text-xs">Customize</span><Switch checked={props.customize} onCheckedChange={props.setCustomize} disabled={props.isMobile} /></div><Button size="sm" variant="outline" onClick={() => { props.resetLayout(); props.setCustomize(false); }}>Reset layout</Button></div>;
}

