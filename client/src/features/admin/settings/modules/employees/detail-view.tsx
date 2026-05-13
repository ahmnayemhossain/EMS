import { Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailRow } from "@/features/admin/settings/modules/users/detail-row";
import { formatEmployeeDate, getOptionName } from "@/features/admin/settings/modules/employees/helpers";
import { EmployeeForm } from "@/features/admin/settings/modules/employees/form";
import type { EmployeeRow, EmployeeLookups, EmployeeValidationErrors } from "@/features/admin/settings/modules/employees/employees.types";
import type { Employee } from "@/core/types/models/admin";

export function EmployeesDetailView(props: {
  selected: EmployeeRow;
  draft: Employee | null;
  lookups: EmployeeLookups;
  errors: EmployeeValidationErrors;
  onDraftChange: (employee: Employee) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return props.draft ? <EditView {...props} /> : <ReadView {...props} />;
}

function EditView(props: any) {
  return <div className="space-y-4"><EmployeeForm value={props.draft} onChange={props.onDraftChange} lookups={props.lookups} errors={props.errors} /><div className="flex items-center justify-between gap-2"><Button variant="outline" onClick={props.onCancel}><X className="mr-2 size-4" />Cancel</Button><Button onClick={props.onSave}>Save</Button></div></div>;
}

function ReadView(props: any) {
  return <div className="space-y-4"><div className="rounded-lg border px-3"><DetailRow label="Name">{props.selected.name}</DetailRow><DetailRow label="Employee ID">{props.selected.employeeId}</DetailRow><DetailRow label="Company">{getOptionName(props.lookups.facilities, props.selected.companyId)}</DetailRow><DetailRow label="Department">{getOptionName(props.lookups.departments, props.selected.departmentId)}</DetailRow><DetailRow label="Designation">{getOptionName(props.lookups.designations, props.selected.designationId)}</DetailRow><DetailRow label="Status"><StatusBadge tone={props.selected.status === 1 ? "compliant" : "neutral"}>{props.selected.status === 1 ? "active" : "inactive"}</StatusBadge></DetailRow><DetailRow label="Email">{props.selected.email}</DetailRow><DetailRow label="Phone">{props.selected.phone || "-"}</DetailRow><DetailRow label="Date of joining">{formatEmployeeDate(props.selected.joinedOn)}</DetailRow><DetailRow label="Created by">{props.selected.createdByUserName || "-"}</DetailRow><DetailRow label="Updated by">{props.selected.updatedByUserName || "-"}</DetailRow></div><div className="flex items-center justify-between gap-2"><Button variant="destructive" onClick={props.onDelete}><Trash2 className="mr-2 size-4" />Delete</Button><Button onClick={props.onEdit}><Pencil className="mr-2 size-4" />Edit</Button></div></div>;
}


