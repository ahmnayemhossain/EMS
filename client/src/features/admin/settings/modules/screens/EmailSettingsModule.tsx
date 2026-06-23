import * as React from "react";
import { ArrowLeft, Eye, RefreshCw, Save } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/primitives/dialog";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Switch } from "@/components/ui/primitives/switch";
import { Textarea } from "@/components/ui/primitives/textarea";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { getEmailSettings, type EmailSettings, updateEmailSettings } from "@/features/admin/settings/modules/services/emailSettingsApi";

type Draft = Omit<EmailSettings, "id" | "key">;

const PREVIEW_VARIABLES: Record<string, Record<string, string>> = {
  login_log: {
    appName: "EMS",
    userName: "A. H. M Nayem Hossain",
    username: "700901",
    employeeId: "700901",
    userEmail: "nayem@softnan.com",
    loginAt: "08 May 2026, 07:10 PM",
    ipAddress: "192.168.50.118",
  },
  utility_approval_submission: {
    appName: "EMS",
    companyName: "Fortis Group",
    utilityType: "Electricity",
    meterName: "Main Grid Meter",
    billMonth: "2026-01",
    recordCount: "2",
    totalValue: "18250",
    unit: "kWh",
    submittedBy: "A. H. M Nayem Hossain",
    submittedAt: "08 May 2026, 07:10 PM",
  },
};

const DEFAULTS: Record<string, Draft> = {
  login_log: {
    isActive: false,
    smtpHost: "",
    smtpPort: 465,
    smtpSecure: true,
    smtpUsername: "",
    smtpPassword: "",
    fromName: "EMS",
    fromEmail: "",
    recipientEmails: [],
    subjectTemplate: "Login alert: {{userName}}",
    htmlTemplate: "<!doctype html><html><body><h2>Login alert</h2><p><strong>{{userName}}</strong> signed in to {{appName}}.</p></body></html>",
  },
  utility_approval_submission: {
    isActive: false,
    smtpHost: "",
    smtpPort: 465,
    smtpSecure: true,
    smtpUsername: "",
    smtpPassword: "",
    fromName: "EMS",
    fromEmail: "",
    recipientEmails: [],
    subjectTemplate: "Utility approval required: {{companyName}} {{utilityType}} {{billMonth}}",
    htmlTemplate: "<!doctype html><html><body><h2>Utility approval required</h2><p><strong>{{companyName}}</strong> submitted utility data for approval.</p></body></html>",
  },
};

export function EmailSettingsModule(props: {
  settingKey: "login_log" | "utility_approval_submission";
  title: string;
  description: string;
  onBack?: () => void;
}) {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(DEFAULTS[props.settingKey]);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const settings = await getEmailSettings(userId, props.settingKey);
      setDraft({
        isActive: settings.isActive,
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpSecure: settings.smtpSecure,
        smtpUsername: settings.smtpUsername,
        smtpPassword: settings.smtpPassword,
        fromName: settings.fromName,
        fromEmail: settings.fromEmail,
        recipientEmails: settings.recipientEmails,
        subjectTemplate: settings.subjectTemplate,
        htmlTemplate: settings.htmlTemplate,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load email settings.");
    } finally {
      setLoading(false);
    }
  }, [props.settingKey, userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      await updateEmailSettings(userId, props.settingKey, draft);
      toast.success("Email settings saved.");
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save email settings.");
    } finally {
      setSaving(false);
    }
  }

  const previewVariables = PREVIEW_VARIABLES[props.settingKey];
  const previewHtml = React.useMemo(
    () => renderTemplate(draft.htmlTemplate, previewVariables),
    [draft.htmlTemplate, previewVariables],
  );
  const previewSubject = React.useMemo(
    () => renderTemplate(draft.subjectTemplate, previewVariables),
    [draft.subjectTemplate, previewVariables],
  );

  return (
    <SectionCard
      title={props.title}
      description={props.description}
      action={
        props.onBack ? (
          <Button variant="outline" size="sm" onClick={props.onBack}>
            <ArrowLeft className="mr-2 size-4" />
            Email setup
          </Button>
        ) : null
      }
    >
      <div className="flex items-center justify-between px-4 pt-4 sm:px-6">
        <div className="text-sm text-muted-foreground">{loading ? "Loading from database..." : "Loaded from database."}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="mr-2 size-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 px-4 pb-4 pt-4 xl:grid-cols-[1.1fr_1fr] sm:px-6">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">{props.title}</CardTitle>
            <CardDescription>{props.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">Active</div>
                <div className="text-xs text-muted-foreground">Turn this email notification on or off.</div>
              </div>
              <Switch checked={draft.isActive} onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, isActive: checked }))} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="SMTP host"><Input value={draft.smtpHost} onChange={(e) => setDraft((prev) => ({ ...prev, smtpHost: e.target.value }))} placeholder="smtp.example.com" disabled={loading} /></Field>
              <Field label="SMTP port"><Input type="number" value={String(draft.smtpPort || "")} onChange={(e) => setDraft((prev) => ({ ...prev, smtpPort: Number(e.target.value || 0) }))} placeholder="465" disabled={loading} /></Field>
              <Field label="SMTP username"><Input value={draft.smtpUsername} onChange={(e) => setDraft((prev) => ({ ...prev, smtpUsername: e.target.value }))} placeholder="username" disabled={loading} /></Field>
              <Field label="SMTP password"><Input type="password" value={draft.smtpPassword} onChange={(e) => setDraft((prev) => ({ ...prev, smtpPassword: e.target.value }))} placeholder="password" disabled={loading} /></Field>
              <Field label="From name"><Input value={draft.fromName} onChange={(e) => setDraft((prev) => ({ ...prev, fromName: e.target.value }))} placeholder="EMS" disabled={loading} /></Field>
              <Field label="From email"><Input value={draft.fromEmail} onChange={(e) => setDraft((prev) => ({ ...prev, fromEmail: e.target.value }))} placeholder="noreply@example.com" disabled={loading} /></Field>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">Secure SMTP</div>
                <div className="text-xs text-muted-foreground">Use direct SSL/TLS SMTP, usually port 465.</div>
              </div>
              <Switch checked={draft.smtpSecure} onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, smtpSecure: checked }))} />
            </div>

            <Field label="Recipient emails">
              <Input value={draft.recipientEmails.join(", ")} onChange={(e) => setDraft((prev) => ({ ...prev, recipientEmails: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} placeholder="admin@example.com, compliance@example.com" disabled={loading} />
            </Field>

            <Field label="Subject template">
              <Input value={draft.subjectTemplate} onChange={(e) => setDraft((prev) => ({ ...prev, subjectTemplate: e.target.value }))} disabled={loading} />
            </Field>

            <Field label="HTML template">
              <Textarea value={draft.htmlTemplate} onChange={(e) => setDraft((prev) => ({ ...prev, htmlTemplate: e.target.value }))} className="min-h-72 font-mono text-xs" disabled={loading} />
            </Field>

            <Button onClick={() => void save()} disabled={loading || saving}>
              <Save className="mr-2 size-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Template preview</CardTitle>
            <CardDescription>Available tokens are rendered in preview and live emails.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
              <div className="mb-2 font-medium text-foreground">Available tokens</div>
              <div className="grid gap-1 sm:grid-cols-2">
                {Object.keys(previewVariables).map((key) => (
                  <div key={key} className="font-mono">{`{{${key}}}`}</div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-background">
              <div className="border-b px-4 py-3">
                <div className="text-xs text-muted-foreground">Subject</div>
                <div className="text-sm font-medium">{previewSubject}</div>
              </div>
              <iframe title="Email preview" srcDoc={previewHtml} className="h-[420px] w-full rounded-b-lg bg-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Email HTML preview</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border bg-background">
            <div className="border-b px-4 py-3">
              <div className="text-xs text-muted-foreground">Subject</div>
              <div className="text-sm font-medium">{previewSubject}</div>
            </div>
            <iframe title="Email full preview" srcDoc={previewHtml} className="h-[70vh] w-full rounded-b-lg bg-white" />
          </div>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{props.label}</Label>
      {props.children}
    </div>
  );
}

function renderTemplate(template: string, variables: Record<string, string>) {
  return String(template || "").replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => variables[key] ?? "");
}


