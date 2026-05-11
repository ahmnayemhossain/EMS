import { useNavigate } from "react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import type { SettingsCardDef, SettingsCardKey } from "@/features/admin/settings/home/settings-types";

export function SettingsLauncherCard(props: {
  def: SettingsCardDef;
  onOpenDrawer: (key: SettingsCardKey) => void;
}) {
  const navigate = useNavigate();
  const Icon = props.def.icon;
  return (
    <button
      type="button"
      className="text-left"
      onClick={() => props.def.openAs === "page" && props.def.to ? navigate(props.def.to) : props.onOpenDrawer(props.def.key)}
    >
      <Card className="hover:bg-muted/10 h-full transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="bg-muted/20 text-muted-foreground grid size-10 shrink-0 place-items-center rounded-lg border"><Icon className="size-4" /></div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold">{props.def.title}</CardTitle>
              <div className="text-muted-foreground mt-1 text-xs leading-relaxed">{props.def.description}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0"><div className="text-muted-foreground text-xs">{props.def.openAs === "page" ? "Open page" : "Quick view"}</div></CardContent>
      </Card>
    </button>
  );
}

