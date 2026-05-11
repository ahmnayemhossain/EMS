import * as React from "react";
import { Save, RefreshCw } from "lucide-react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { listUtilityConversionRules, upsertUtilityConversionRule } from "@/features/admin/settings/modules/utilitiesRulesApi";

const RULE_KEY = "generator_diesel_kwh_per_liter";

export function UtilitiesRulesSettingsModule() {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [value, setValue] = React.useState("3.5");

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const rules = await listUtilityConversionRules(userId);
      const hit = rules.find((r) => r.key === RULE_KEY && r.companyId === null) ?? rules.find((r) => r.key === RULE_KEY) ?? null;
      setValue(hit ? String(hit.value) : "3.5");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load utilities rules.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) return toast.error("Value must be a positive number.");
    setSaving(true);
    try {
      await upsertUtilityConversionRule(userId, { companyId: null, key: RULE_KEY, value: next, isActive: true });
      toast.success("Saved.");
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save rule.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard
      title="Utilities rules"
      description="Small admin controls for practical utility calculations. These rules affect how consumption is calculated in Utilities create/edit forms."
    >
      <div className="flex items-center justify-between px-4 pt-4 sm:px-6">
        <div className="text-sm text-muted-foreground">
          {loading ? "Loading from database..." : "Loaded from database."}
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 px-4 pb-4 pt-4 sm:grid-cols-2 sm:px-6">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Generator diesel Ã¢â€ â€™ kWh</CardTitle>
            <CardDescription>
              Electricity source is Generator: kWh = liters Ãƒâ€” factor.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>kWh per liter (kWh/L)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 3.5"
                disabled={loading}
              />
            </div>
            <Button onClick={() => void save()} disabled={loading || saving}>
              <Save className="mr-2 size-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </SectionCard>
  );
}


