import { Input } from "@/components/ui/primitives/input";
import { SelectFilter } from "@/components/forms/SelectFilter";
import { Field } from "@/features/admin/settings/modules/users/field";
import { PermissionMatrix } from "@/features/admin/settings/modules/roles/permission-matrix";
import type { PermissionOption, RoleEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";
import type { RoleValidationErrors } from "@/features/admin/settings/modules/roles/roles.types";

export function RoleForm(props: { value: RoleEntity; onChange: (role: RoleEntity) => void; permissions: PermissionOption[]; errors?: RoleValidationErrors }) {
  return <div className="grid gap-5"><div className="grid gap-3 sm:grid-cols-2"><Field label="Role name" required error={props.errors?.name}><Input value={props.value.name} aria-invalid={Boolean(props.errors?.name) || undefined} onChange={(event) => props.onChange({ ...props.value, name: event.target.value })} placeholder="Role name" /></Field><Field label="Status" required error={props.errors?.status}><SelectFilter value={String(props.value.status)} onChange={(status) => props.onChange({ ...props.value, status: status === "0" ? 0 : 1 })} placeholder="Status" invalid={Boolean(props.errors?.status)} className="w-full" items={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} /></Field><div className="sm:col-span-2"><Field label="Description"><Input value={props.value.description ?? ""} onChange={(event) => props.onChange({ ...props.value, description: event.target.value })} placeholder="Optional" /></Field></div></div><Field label="Permissions" required error={props.errors?.permissionKeys}><PermissionMatrix permissionKeys={props.value.permissionKeys} permissions={props.permissions} invalid={Boolean(props.errors?.permissionKeys)} onChange={(permissionKeys) => props.onChange({ ...props.value, permissionKeys })} /></Field></div>;
}


