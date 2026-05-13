import { Input } from "@/components/ui/primitives/input";
import { SelectFilter } from "@/components/forms/SelectFilter";
import type { SettingsEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";
import type { UtilityTypeOption } from "@/features/admin/settings/modules/services/uomSettingsApi";
import type { MasterWiringConfig, WiringDraft } from "@/features/admin/settings/modules/master-wiring/types";

export function MasterEntityForm(props: { config: MasterWiringConfig; value: SettingsEntity; onChange: (next: SettingsEntity) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2"><Field label={props.config.relationLabel}><Input value={props.value.name} onChange={(event) => props.onChange({ ...props.value, name: event.target.value })} placeholder={`${props.config.relationLabel} name`} /></Field><StatusField value={props.value.status} onChange={(status) => props.onChange({ ...props.value, status })} /></div>;
}

export function WiringForm(props: { config: MasterWiringConfig; value: WiringDraft; onChange: (next: WiringDraft) => void; relationOptions: SettingsEntity[]; utilityTypeOptions: UtilityTypeOption[] }) {
  return <div className="grid gap-3 sm:grid-cols-2"><Field label="Utility type"><SelectFilter value={props.value.utilityTypeId} onChange={(utilityTypeId) => props.onChange({ ...props.value, utilityTypeId })} placeholder="Select utility type" className="w-full" items={props.utilityTypeOptions.map((item) => ({ value: item.id, label: item.name }))} /></Field><Field label={props.config.relationLabel}><SelectFilter value={props.value.relationId} onChange={(relationId) => props.onChange({ ...props.value, relationId })} placeholder={props.config.relationPlaceholder} className="w-full" items={props.relationOptions.map((item) => ({ value: item.id, label: item.name }))} /></Field><div className="sm:col-span-2"><StatusField value={props.value.status} onChange={(status) => props.onChange({ ...props.value, status })} /></div></div>;
}

function Field(props: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><div className="text-xs text-muted-foreground">{props.label} <span className="text-destructive">*</span></div>{props.children}</div>;
}

function StatusField(props: { value: 0 | 1; onChange: (status: 0 | 1) => void }) {
  return <Field label="Status"><SelectFilter value={String(props.value)} onChange={(status) => props.onChange(status === "0" ? 0 : 1)} placeholder="Status" className="w-full" items={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} /></Field>;
}


