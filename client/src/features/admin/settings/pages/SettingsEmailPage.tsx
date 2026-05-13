import * as React from "react";
import { ArrowLeft, ChevronRight, MailCheck, Send, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/primitives/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { EmailSettingsModule } from "../modules/screens/EmailSettingsModule";

type EmailCardKey = "home" | "login_log" | "utility_approval_submission";

export function SettingsEmailPage() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = React.useState<EmailCardKey>("home");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => (activeCard === "home" ? navigate("/settings") : setActiveCard("home"))}>
          <ArrowLeft className="mr-2 size-4" />
          {activeCard === "home" ? "Settings" : "Email setup"}
        </Button>
      </div>

      {activeCard === "home" ? (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Email setup</h1>
            <p className="text-sm text-muted-foreground">Email-related admin controls ekhan theke card-wise manage kora jabe.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={() => setActiveCard("login_log")}
              className="text-left"
            >
              <Card className="h-full transition hover:border-primary/40 hover:shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border bg-muted/30 p-2">
                        <MailCheck className="size-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                    <CardTitle className="text-base">Sign log email</CardTitle>
                    <CardDescription>Successful login hole email notification jabe.</CardDescription>
                  </div>
                </div>
                <ChevronRight className="mt-0.5 size-4 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </button>

            <button type="button" onClick={() => setActiveCard("utility_approval_submission")} className="text-left">
              <Card className="h-full transition hover:border-primary/40 hover:shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border bg-muted/30 p-2">
                        <Send className="size-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">Utility approval email</CardTitle>
                        <CardDescription>Full month submit hole approver email pabe.</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="mt-0.5 size-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </button>

            <Card className="h-full border-dashed opacity-80">
              <CardHeader className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <ShieldAlert className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">Security emails</CardTitle>
                    <CardDescription>Password reset, suspicious login, access change emails pore add hobe.</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      ) : null}

      {activeCard === "login_log" ? <EmailSettingsModule settingKey="login_log" title="Sign log email" description="Successful login hole ei notification SMTP diye email send korbe." onBack={() => setActiveCard("home")} /> : null}
      {activeCard === "utility_approval_submission" ? <EmailSettingsModule settingKey="utility_approval_submission" title="Utility approval email" description="Full month utility data submit hole approver-ra ei email pabe." onBack={() => setActiveCard("home")} /> : null}
    </div>
  );
}


