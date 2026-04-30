import { Input } from "@/core/app/components/ui/input";
import { SelectFilter } from "@/core/components/SelectFilter";
import { Field } from "@/core/settings/modules/users/field";
import type { Employee } from "@/core/types/admin";
import type { EmployeeLookups, EmployeeValidationErrors } from "@/core/settings/modules/employees/employees.types";

export function EmployeeForm(props: {
  value: Employee;
  onChange: (employee: Employee) => void;
  lookups: EmployeeLookups;
  errors?: EmployeeValidationErrors;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Employee ID" required error={props.errors?.employeeId}><Input type="number" required aria-required="true" aria-invalid={Boolean(props.errors?.employeeId) || undefined} value={props.value.employeeId} onChange={(event) => props.onChange({ ...props.value, employeeId: Number(event.target.value) })} placeholder="1001" /></Field>
        <Field label="Name" required error={props.errors?.name}><Input required aria-required="true" aria-invalid={Boolean(props.errors?.name) || undefined} value={props.value.name} onChange={(event) => props.onChange({ ...props.value, name: event.target.value })} placeholder="Employee name" /></Field>
        <Field label="Email" required error={props.errors?.email}><Input type="email" required aria-required="true" aria-invalid={Boolean(props.errors?.email) || undefined} value={props.value.email} onChange={(event) => props.onChange({ ...props.value, email: event.target.value })} placeholder="employee@example.com" /></Field>
        <Field label="Phone"><Input value={props.value.phone ?? ""} onChange={(event) => props.onChange({ ...props.value, phone: event.target.value })} placeholder="Optional" /></Field>
        <Field label="Company" required error={props.errors?.companyId}><SelectFilter value={props.value.companyId || undefined} onChange={(value) => props.onChange({ ...props.value, companyId: value || props.value.companyId })} placeholder="Company" items={props.lookups.facilities.map((item) => ({ value: item.id, label: item.name }))} invalid={Boolean(props.errors?.companyId)} className="w-full" /></Field>
        <Field label="Department" required error={props.errors?.departmentId}><SelectFilter value={props.value.departmentId || undefined} onChange={(value) => props.onChange({ ...props.value, departmentId: value || props.value.departmentId })} placeholder="Department" items={props.lookups.departments.map((item) => ({ value: item.id, label: item.name }))} invalid={Boolean(props.errors?.departmentId)} className="w-full" /></Field>
        <Field label="Designation" required error={props.errors?.designationId}><SelectFilter value={props.value.designationId || undefined} onChange={(value) => props.onChange({ ...props.value, designationId: value || props.value.designationId })} placeholder="Designation" items={props.lookups.designations.map((item) => ({ value: item.id, label: item.name }))} invalid={Boolean(props.errors?.designationId)} className="w-full" /></Field>
        <Field label="Active status" required error={props.errors?.status}><SelectFilter value={String(props.value.status)} onChange={(value) => props.onChange({ ...props.value, status: value === "1" ? 1 : 0 })} placeholder="Status" invalid={Boolean(props.errors?.status)} className="w-full" items={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} /></Field>
        <Field label="Date of joining"><Input type="date" value={props.value.joinedOn ?? ""} onChange={(event) => props.onChange({ ...props.value, joinedOn: event.target.value })} /></Field>
      </div>
    </div>
  );
}
