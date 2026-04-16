export type EmsUser = {
  id: string;
  name: string;
  employeeId: string;
};

export const emsUsers: EmsUser[] = [
  { id: "u_nayem_700901", name: "Nayem", employeeId: "700901" },
  { id: "u_mehedi_70900", name: "Mehedi", employeeId: "70900" },
  { id: "u_nimur_700999", name: "Nimur", employeeId: "700999" },
  { id: "u_munna_700902", name: "Munna", employeeId: "700902" },
  { id: "u_sakib_700903", name: "Sakib", employeeId: "700903" },
  { id: "u_aminul_700905", name: "Aminul", employeeId: "700905" },
  { id: "u_parvej_700906", name: "Parvej", employeeId: "700906" },
];

export const defaultUserId = emsUsers[0]?.id ?? "u_nayem_700901";

export function formatUserLabel(u: EmsUser) {
  return `${u.name} (${u.employeeId})`;
}

