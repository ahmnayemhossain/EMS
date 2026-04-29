import { Input } from "@/app/components/ui/input";
import { SelectFilter } from "@/components/SelectFilter";
import { Field } from "@/pages/settings/modules/users/field";
import type { SettingsEntity } from "@/pages/settings/modules/settingsEntityApi";
import type { EntityValidationErrors } from "@/pages/settings/modules/entity-manager/types";

export function EntityManagerForm(props: { value: SettingsEntity; onChange: (item: SettingsEntity) => void; label: string; errors?: EntityValidationErrors }) {
  return <div className="grid gap-3 sm:grid-cols-2"><Field label={`${props.label} name`} required error={props.errors?.name}><Input value={props.value.name} aria-invalid={Boolean(props.errors?.name) || undefined} onChange={(event) => props.onChange({ ...props.value, name: event.target.value })} placeholder={`${props.label} name`} /></Field><Field label="Status" required error={props.errors?.status}><SelectFilter value={String(props.value.status)} onChange={(status) => props.onChange({ ...props.value, status: status === "0" ? 0 : 1 })} placeholder="Status" invalid={Boolean(props.errors?.status)} className="w-full" items={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} /></Field></div>;
}
