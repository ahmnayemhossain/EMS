import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";

type SettingsPageFrameProps = {
  backTo: string;
  backLabel: string;
  children: ReactNode;
};

export function SettingsPageFrame(props: SettingsPageFrameProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(props.backTo)}
        >
          <ArrowLeft className="mr-2 size-4" />
          {props.backLabel}
        </Button>
      </div>
      {props.children}
    </div>
  );
}
