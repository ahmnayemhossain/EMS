import { appRouteDefs } from "@/core/routes/app-route-registry";
import type { ApprovalHierarchyConfig, ApprovalHierarchyGroup } from "@/features/admin/settings/modules/services/approvalHierarchyApi";

export type ApprovalPageOption = {
  key: string;
  name: string;
  moduleKey: string;
  description: string;
};

export function listApprovalPageOptions(config: ApprovalHierarchyConfig) {
  const seen = new Set<string>();
  const options: ApprovalPageOption[] = [];

  for (const group of config.groups) {
    const moduleKey = String(group.moduleKey || "").trim().toLowerCase();
    if (!moduleKey || seen.has(moduleKey)) {
      continue;
    }
    seen.add(moduleKey);
    options.push({
      key: group.key,
      name: group.name,
      moduleKey,
      description: group.description || "",
    });
  }

  for (const route of appRouteDefs) {
    const moduleKey = String(route.segment || "").trim().toLowerCase();
    if (!moduleKey || seen.has(moduleKey) || isExcludedModule(moduleKey)) {
      continue;
    }
    seen.add(moduleKey);
    options.push({
      key: `${moduleKey}_approval_flow`,
      name: route.label,
      moduleKey,
      description: `${route.label} approval flow`,
    });
  }

  return options.sort((left, right) => left.name.localeCompare(right.name));
}

export function ensureApprovalGroup(config: ApprovalHierarchyConfig, option: ApprovalPageOption) {
  const existing = config.groups.find((group) => group.moduleKey === option.moduleKey) || config.groups.find((group) => group.key === option.key);
  if (existing) {
    return { config, group: existing };
  }

  const nextGroup: ApprovalHierarchyGroup = {
    key: option.key,
    name: option.name,
    moduleKey: option.moduleKey,
    description: option.description,
    isDefault: false,
    isActive: true,
    stepKeys: [],
    transitionKeys: [],
  };

  return {
    config: {
      ...config,
      groups: [...config.groups, nextGroup],
    },
    group: nextGroup,
  };
}

function isExcludedModule(moduleKey: string) {
  return moduleKey === "dashboard" || moduleKey === "settings" || moduleKey === "companies" || moduleKey === "facilities";
}
