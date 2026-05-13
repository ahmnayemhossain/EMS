import { KeyRound, Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/primitives/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DetailRow } from "@/features/admin/settings/modules/users/detail-row";
import { UserForm } from "@/features/admin/settings/modules/users/user-form";
import type { UserCompanyOption, UserRoleOption, UserValidationErrors } from "@/features/admin/settings/modules/users/users.types";
import type { UserEmployeeOption, UserInput } from "@/features/admin/settings/modules/services/usersApi";

export function UsersDetailView(props: {
  selected: UserInput;
  draft: UserInput | null;
  errors: UserValidationErrors;
  employees: UserEmployeeOption[];
  roles: UserRoleOption[];
  companies: UserCompanyOption[];
  onDraftChange: (user: UserInput) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
  onEdit: () => void;
}) {
  return props.draft ? <EditView {...props} /> : <ReadView {...props} />;
}

function EditView(props: any) {
  return <div className="space-y-4"><UserForm value={props.draft} onChange={props.onDraftChange} employees={props.employees} roles={props.roles} companies={props.companies} errors={props.errors} /><div className="flex items-center justify-between gap-2"><Button variant="outline" onClick={props.onCancel}><X className="mr-2 size-4" />Cancel</Button><Button onClick={props.onSave}>Save</Button></div></div>;
}

function ReadView(props: any) {
  const companyBadges = props.selected.companyAccessIds?.length ? props.selected.companyAccessIds.map((id: string) => <StatusBadge key={id} tone="neutral">{props.companies.find((company: UserCompanyOption) => company.id === id)?.name || "Company"}</StatusBadge>) : "-";
  const roleBadges = props.selected.roleIds.length ? props.selected.roleIds.map((id: string) => <StatusBadge key={id} tone="neutral">{props.roles.find((role: UserRoleOption) => role.id === id)?.name || "Role"}</StatusBadge>) : "-";
  return <div className="space-y-4"><div className="rounded-lg border px-3"><DetailRow label="Employee">{props.selected.employeeName || "-"}</DetailRow><DetailRow label="Employee ID">{props.selected.employeeId || "-"}</DetailRow><DetailRow label="Company">{props.selected.companyName || "-"}</DetailRow><DetailRow label="Username">{props.selected.username}</DetailRow><DetailRow label="Email">{props.selected.email}</DetailRow><DetailRow label="Status"><StatusBadge tone={props.selected.status === "active" ? "compliant" : "warning"}>{props.selected.status}</StatusBadge></DetailRow><DetailRow label="Company access"><div className="flex flex-wrap justify-end gap-1">{companyBadges}</div></DetailRow><DetailRow label="Roles"><div className="flex flex-wrap justify-end gap-1">{roleBadges}</div></DetailRow><DetailRow label="Created by">{props.selected.createdByUserName || "-"}</DetailRow><DetailRow label="Updated by">{props.selected.updatedByUserName || "-"}</DetailRow></div><div className="flex items-center justify-between gap-2"><Button variant="destructive" onClick={props.onDelete}><Trash2 className="mr-2 size-4" />Delete</Button><div className="flex items-center gap-2"><Button variant="outline" onClick={props.onResetPassword}><KeyRound className="mr-2 size-4" />Reset</Button><Button onClick={props.onEdit}><Pencil className="mr-2 size-4" />Edit</Button></div></div></div>;
}


