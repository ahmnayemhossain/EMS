import type { DataColumn } from "@/core/components/DataTable";
import { StatusBadge } from "@/core/components/StatusBadge";
import { AvatarInitials } from "@/core/settings/modules/users/avatar-initials";
import type { UserRoleOption } from "@/core/settings/modules/users/users.types";
import type { UserInput } from "@/core/settings/modules/usersApi";

export function buildUsersColumns(roles: UserRoleOption[]): Array<DataColumn<UserInput>> {
  return [
    {
      id: "user",
      header: "User",
      cell: (user) => <UserCell user={user} />,
    },
    {
      id: "roles",
      header: "Roles",
      cell: (user) => <RoleBadges user={user} roles={roles} />,
      className: "hidden lg:table-cell",
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => <StatusBadge tone={user.status === "active" ? "compliant" : "warning"}>{user.status}</StatusBadge>,
      className: "text-right",
    },
  ];
}

function UserCell({ user }: { user: UserInput }) {
  return <div className="flex min-w-0 items-center gap-3"><AvatarInitials label={user.employeeName || user.username} /><div className="min-w-0"><div className="truncate text-sm font-medium">{user.employeeName || "Unknown"} <span className="font-normal text-muted-foreground">({user.username})</span></div><div className="mt-0.5 text-xs text-muted-foreground">{user.email} - ID {user.employeeId}</div></div></div>;
}

function RoleBadges(props: { user: UserInput; roles: UserRoleOption[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {props.user.roleIds.slice(0, 2).map((id) => <StatusBadge key={id} tone="neutral">{props.roles.find((role) => role.id === id)?.name || "Role"}</StatusBadge>)}
      {props.user.roleIds.length > 2 ? <StatusBadge tone="neutral">+{props.user.roleIds.length - 2}</StatusBadge> : null}
    </div>
  );
}
