import { Input } from "@/app/components/ui/input";
import { SelectFilter } from "@/components/SelectFilter";
import { CompanyAccessSelect } from "@/pages/settings/modules/users/company-access-select";
import { EmployeeSelect } from "@/pages/settings/modules/users/employee-select";
import { Field } from "@/pages/settings/modules/users/field";
import { buildUserFromEmployee } from "@/pages/settings/modules/users/form-helpers";
import type { UserCompanyOption, UserRoleOption, UserValidationErrors } from "@/pages/settings/modules/users/users.types";
import type { UserEmployeeOption, UserInput } from "@/pages/settings/modules/usersApi";

export function UserForm(props: {
  value: UserInput;
  onChange: (user: UserInput) => void;
  employees: UserEmployeeOption[];
  roles: UserRoleOption[];
  companies: UserCompanyOption[];
  errors?: UserValidationErrors;
}) {
  const selectedEmployee = props.employees.find((employee) => employee.id === props.value.employeeDbId);
  const username = selectedEmployee?.employeeId ? String(selectedEmployee.employeeId) : props.value.username;
  const email = selectedEmployee?.email || props.value.email;

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Employee" required error={props.errors?.employeeDbId}><EmployeeSelect value={props.value.employeeDbId} employees={props.employees} invalid={Boolean(props.errors?.employeeDbId)} onChange={(employeeDbId) => props.onChange(buildUserFromEmployee(props.value, employeeDbId, props.employees))} /></Field>
        <Field label="Status" required><SelectFilter value={props.value.status} onChange={(status) => props.onChange({ ...props.value, status: status === "suspended" ? "suspended" : "active" })} placeholder="Status" className="w-full" items={[{ value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }]} /></Field>
        <Field label="Username" required error={props.errors?.username}><Input value={username} readOnly aria-invalid={Boolean(props.errors?.username) || undefined} className="bg-muted/40" placeholder="Auto from employee ID" /></Field>
        <Field label="Email" required error={props.errors?.email}><Input type="email" value={email} readOnly aria-invalid={Boolean(props.errors?.email) || undefined} className="bg-muted/40" placeholder="Auto from employee email" /></Field>
        <Field label="Company access" required error={props.errors?.companyAccessIds} className="sm:col-span-2"><CompanyAccessSelect value={props.value.companyAccessIds ?? []} companies={props.companies} invalid={Boolean(props.errors?.companyAccessIds)} onChange={(companyAccessIds) => props.onChange({ ...props.value, companyAccessIds })} /></Field>
      </div>
      <Field label="Roles" required error={props.errors?.roleIds}><RoleChecklist value={props.value} roles={props.roles} invalid={Boolean(props.errors?.roleIds)} onChange={props.onChange} /></Field>
    </div>
  );
}

function RoleChecklist(props: { value: UserInput; roles: UserRoleOption[]; invalid: boolean; onChange: (user: UserInput) => void }) {
  return (
    <div className={props.invalid ? "grid gap-2 rounded-lg border border-destructive p-3 ring-[3px] ring-destructive/20" : "grid gap-2 rounded-lg border p-3"}>
      {props.roles.map((role) => <RoleCheckbox key={role.id} role={role} value={props.value} onChange={props.onChange} />)}
    </div>
  );
}

function RoleCheckbox(props: { role: UserRoleOption; value: UserInput; onChange: (user: UserInput) => void }) {
  const checked = props.value.roleIds.includes(props.role.id);
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="mt-1 accent-destructive" checked={checked} onChange={(event) => props.onChange({ ...props.value, roleIds: event.target.checked ? Array.from(new Set([...props.value.roleIds, props.role.id])) : props.value.roleIds.filter((id) => id !== props.role.id) })} />
      <span className="min-w-0"><span className="block text-sm font-medium">{props.role.name}</span>{props.role.description ? <span className="mt-0.5 block text-xs text-muted-foreground">{props.role.description}</span> : null}</span>
    </label>
  );
}
