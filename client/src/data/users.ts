export type EmsUser = {
  id: string;
  name: string;
  employeeId: string;
};

export const emsUsers: EmsUser[] = [
  { id: "u_userone_EMP-0001", name: "User One", employeeId: "EMP-0001" },
  { id: "u_usertwo_EMP-0002", name: "User Two", employeeId: "EMP-0002" },
  { id: "u_userthree_EMP-0003", name: "User Three", employeeId: "EMP-0003" },
  { id: "u_userfour_EMP-0004", name: "User Four", employeeId: "EMP-0004" },
  { id: "u_userfive_EMP-0005", name: "User Five", employeeId: "EMP-0005" },
  { id: "u_usersix_EMP-0006", name: "User Six", employeeId: "EMP-0006" },
  { id: "u_userseven_EMP-0007", name: "User Seven", employeeId: "EMP-0007" },
];

export const defaultUserId = emsUsers[0]?.id ?? "u_userone_EMP-0001";

export function formatUserLabel(u: EmsUser) {
  return `${u.name} (${u.employeeId})`;
}

