import type {
  ApprovalHierarchyConfig,
  ApprovalHierarchyGroup,
  ApprovalHierarchyTransition,
} from "@/features/admin/settings/modules/services/approvalHierarchyApi";

export function resolveApprovalGroup(
  config: ApprovalHierarchyConfig,
  selectedGroupKey: string,
) {
  return (
    config.groups.find((group) => group.moduleKey === selectedGroupKey) ||
    config.groups.find((group) => group.key === selectedGroupKey) ||
    null
  );
}

export function readApprovalStepLabel(
  stepKey: string,
  config: ApprovalHierarchyConfig,
) {
  return config.steps.find((step) => step.key === stepKey)?.name || stepKey;
}

export function buildApprovalTransitionKey(fromStepKey: string, toStepKey: string) {
  return `${fromStepKey}_to_${toStepKey}`;
}

export function buildLinearApprovalTransitions(
  config: ApprovalHierarchyConfig,
  group: ApprovalHierarchyGroup | null,
) {
  if (!group) {
    return [];
  }

  const transitions: ApprovalHierarchyTransition[] = [];
  for (let index = 0; index < group.stepKeys.length - 1; index += 1) {
    const fromStepKey = group.stepKeys[index];
    const toStepKey = group.stepKeys[index + 1];
    transitions.push(
      ensureApprovalTransition(config, fromStepKey, toStepKey),
      ensureApprovalTransition(config, toStepKey, fromStepKey),
    );
  }
  return transitions;
}

export function buildApprovalConfigForSave(
  config: ApprovalHierarchyConfig,
  group: ApprovalHierarchyGroup | null,
) {
  if (!group) {
    return config;
  }

  const ensuredTransitions = [...config.transitions];
  const transitionKeys: string[] = [];

  for (let index = 0; index < group.stepKeys.length - 1; index += 1) {
    const fromStepKey = group.stepKeys[index];
    const toStepKey = group.stepKeys[index + 1];
    const forward = ensureApprovalTransition(
      { ...config, transitions: ensuredTransitions },
      fromStepKey,
      toStepKey,
      ensuredTransitions,
    );
    const reverse = ensureApprovalTransition(
      { ...config, transitions: ensuredTransitions },
      toStepKey,
      fromStepKey,
      ensuredTransitions,
    );
    transitionKeys.push(forward.key, reverse.key);
  }

  return {
    ...config,
    transitions: ensuredTransitions,
    groups: config.groups.map((item) =>
      item.key === group.key ? { ...item, transitionKeys } : item,
    ),
  };
}

function ensureApprovalTransition(
  config: ApprovalHierarchyConfig,
  fromStepKey: string,
  toStepKey: string,
  mutableTransitions = config.transitions,
) {
  const existing = mutableTransitions.find(
    (transition) =>
      transition.fromStepKey === fromStepKey && transition.toStepKey === toStepKey,
  );
  if (existing) {
    return existing;
  }

  const transition: ApprovalHierarchyTransition = {
    key: buildApprovalTransitionKey(fromStepKey, toStepKey),
    name: `${readApprovalStepLabel(fromStepKey, config)} to ${readApprovalStepLabel(toStepKey, config)}`,
    fromStepKey,
    toStepKey,
    isActive: true,
  };
  mutableTransitions.push(transition);
  return transition;
}
