import { createSystemHeaders, parseSystemResponse, SYSTEM_API } from "@/features/admin/settings/modules/api/system-api";

export type ApprovalHierarchyStep = {
  key: string;
  name: string;
  sortOrder: number;
  isInitial: boolean;
  isFinal: boolean;
  isActive: boolean;
};

export type ApprovalHierarchyTransition = {
  key: string;
  name: string;
  fromStepKey: string;
  toStepKey: string;
  isActive: boolean;
};

export type ApprovalHierarchyGroup = {
  key: string;
  name: string;
  moduleKey: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  stepKeys: string[];
  transitionKeys: string[];
};

export type ApprovalHierarchyRoleMapping = {
  groupKey: string;
  roleId: string;
  transitionKeys: string[];
};

export type ApprovalHierarchyUserMapping = {
  groupKey: string;
  userId: string;
  transitionKeys: string[];
};

export type ApprovalHierarchyRole = {
  id: string;
  name: string;
};

export type ApprovalHierarchyConfig = {
  steps: ApprovalHierarchyStep[];
  transitions: ApprovalHierarchyTransition[];
  groups: ApprovalHierarchyGroup[];
  roleMappings: ApprovalHierarchyRoleMapping[];
  userMappings: ApprovalHierarchyUserMapping[];
  roles: ApprovalHierarchyRole[];
};

const APPROVAL_HIERARCHY_API = `${SYSTEM_API}/approval-hierarchy`;

export async function getApprovalHierarchy(userId: string) {
  const response = await fetch(APPROVAL_HIERARCHY_API, {
    cache: "no-store",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<ApprovalHierarchyConfig>(response, "Could not load approval hierarchy.");
}

export async function saveApprovalHierarchy(userId: string, config: ApprovalHierarchyConfig) {
  const response = await fetch(APPROVAL_HIERARCHY_API, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify({
      steps: config.steps,
      transitions: config.transitions,
      groups: config.groups,
      roleMappings: config.roleMappings,
      userMappings: config.userMappings,
    }),
  });
  return parseSystemResponse<ApprovalHierarchyConfig>(response, "Could not save approval hierarchy.");
}
