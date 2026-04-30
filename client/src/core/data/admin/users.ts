import type { AppUser } from "@/core/types/admin";

import { isoDateTime } from "./helpers";

const baseUsers: AppUser[] = [
  { id: "usr_userone", employeeId: 1001, username: "userone", email: "userone@example.test", roleIds: ["role_admin"], status: "active", lastLoginAt: isoDateTime(4) },
  { id: "usr_usertwo", employeeId: 1002, username: "usertwo", email: "usertwo@example.test", roleIds: ["role_sustainability"], status: "active", lastLoginAt: isoDateTime(12) },
  { id: "usr_userfour", employeeId: 1004, username: "userfour", email: "userfour@example.test", roleIds: ["role_supervisor"], status: "active", lastLoginAt: isoDateTime(30) },
];

const generatedUsers = Array.from({ length: 17 }).map((_, i) => {
  const n = i + 1;
  const employeeId = 3000 + i + 1;
  return { id: `usr_${employeeId}`, employeeId, username: `user${n}`, email: `user${n}@example.test`, roleIds: [i % 3 === 0 ? "role_viewer" : "role_supervisor"], status: i % 7 === 0 ? "suspended" : "active", lastLoginAt: isoDateTime(24 + i * 3) } satisfies AppUser;
});

export const seedUsers: AppUser[] = [...baseUsers, ...generatedUsers];
