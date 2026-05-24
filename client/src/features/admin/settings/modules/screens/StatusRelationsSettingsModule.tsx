import * as React from "react";
import { Plus, RefreshCw, Save, Trash2 } from "lucide-react";

import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { Button } from "@/components/ui/primitives/button";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import {
  getApprovalHierarchy,
  saveApprovalHierarchy,
  type ApprovalHierarchyConfig,
  type ApprovalHierarchyGroup,
  type ApprovalHierarchyStep,
  type ApprovalHierarchyTransition,
} from "@/features/admin/settings/modules/services/approvalHierarchyApi";
import {
  ensureApprovalGroup,
  listApprovalPageOptions,
} from "@/features/admin/settings/modules/screens/approval-pages";

const emptyConfig: ApprovalHierarchyConfig = {
  steps: [],
  transitions: [],
  groups: [],
  roleMappings: [],
  userMappings: [],
  roles: [],
};

export function StatusRelationsSettingsModule() {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [config, setConfig] = React.useState<ApprovalHierarchyConfig>(emptyConfig);
  const [selectedGroupKey, setSelectedGroupKey] = React.useState("");
  const [newStatusName, setNewStatusName] = React.useState("");
  const pageOptions = React.useMemo(() => listApprovalPageOptions(config), [config]);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const next = await getApprovalHierarchy(userId);
      setConfig(next);
      setSelectedGroupKey(
        (current) => current || next.groups[0]?.moduleKey || next.groups[0]?.key || "",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load status relations.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectedGroup =
    config.groups.find((group) => group.moduleKey === selectedGroupKey) ||
    config.groups.find((group) => group.key === selectedGroupKey) ||
    null;

  const selectedSteps = React.useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.stepKeys
      .map((stepKey) => config.steps.find((step) => step.key === stepKey))
      .filter(Boolean) as ApprovalHierarchyStep[];
  }, [config.steps, selectedGroup]);

  const selectedGroupTransitions = React.useMemo(() => {
    if (!selectedGroup) return [];
    return config.transitions.filter((transition) =>
      selectedGroup.transitionKeys.includes(transition.key),
    );
  }, [config.transitions, selectedGroup]);

  async function saveAll() {
    if (!selectedGroup) {
      toast.error("Select a page first.");
      return;
    }
    const validationError = validateGroup(selectedGroup, selectedGroupTransitions);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      setSaving(true);
      const next = await saveApprovalHierarchy(userId, config);
      setConfig(next);
      setSelectedGroupKey(
        (current) => current || next.groups[0]?.moduleKey || next.groups[0]?.key || "",
      );
      toast.success("Status relations saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save status relations.");
    } finally {
      setSaving(false);
    }
  }

  function handlePageChange(nextModuleKey: string) {
    setSelectedGroupKey(nextModuleKey);
    const option = pageOptions.find((item) => item.moduleKey === nextModuleKey);
    if (!option) return;
    setConfig((current) => ensureApprovalGroup(current, option).config);
  }

  function addStatus() {
    if (!selectedGroup) {
      toast.error("Select a page first.");
      return;
    }
    const name = newStatusName.trim();
    if (!name) {
      toast.error("Status name is required.");
      return;
    }

    const existingByName = config.steps.find(
      (step) => step.name.toLowerCase() === name.toLowerCase(),
    );
    const stepKey = existingByName?.key || slugifyStatus(name);

    if (selectedGroup.stepKeys.includes(stepKey)) {
      toast.error("This status already exists in the selected page.");
      return;
    }

    setConfig((current) => {
      const alreadyExists = current.steps.some((step) => step.key === stepKey);
      const nextStep: ApprovalHierarchyStep =
        existingByName || {
          key: stepKey,
          name,
          sortOrder: current.steps.length + 1,
          isInitial: current.steps.length === 0,
          isFinal: false,
          isActive: true,
        };

      return {
        ...current,
        steps: alreadyExists ? current.steps : [...current.steps, nextStep],
        groups: current.groups.map((group) =>
          group.key === selectedGroup.key
            ? { ...group, stepKeys: [...group.stepKeys, stepKey] }
            : group,
        ),
      };
    });
    setNewStatusName("");
  }

  function removeStatus(stepKey: string) {
    if (!selectedGroup) return;
    const isUsed = selectedGroupTransitions.some(
      (transition) =>
        transition.fromStepKey === stepKey || transition.toStepKey === stepKey,
    );
    if (isUsed) {
      toast.error("Remove related status relations first.");
      return;
    }

    setConfig((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.key === selectedGroup.key
          ? { ...group, stepKeys: group.stepKeys.filter((key) => key !== stepKey) }
          : group,
      ),
    }));
  }

  function addRelationRow() {
    if (!selectedGroup) {
      toast.error("Select a page first.");
      return;
    }
    if (selectedSteps.length < 2) {
      toast.error("Add at least two statuses for this page first.");
      return;
    }

    const nextTransition: ApprovalHierarchyTransition = {
      key: buildTransitionKey(selectedGroup.key),
      name: buildTransitionName(selectedSteps[0].key, selectedSteps[1].key, selectedSteps),
      fromStepKey: selectedSteps[0].key,
      toStepKey: selectedSteps[1].key,
      isActive: true,
    };

    setConfig((current) => ({
      ...current,
      transitions: [...current.transitions, nextTransition],
      groups: current.groups.map((group) =>
        group.key === selectedGroup.key
          ? { ...group, transitionKeys: [...group.transitionKeys, nextTransition.key] }
          : group,
      ),
    }));
  }

  function removeRelationRow(transitionKey: string) {
    if (!selectedGroup) return;
    setConfig((current) => ({
      ...current,
      transitions: current.transitions.filter((transition) => transition.key !== transitionKey),
      groups: current.groups.map((group) =>
        group.key === selectedGroup.key
          ? {
              ...group,
              transitionKeys: group.transitionKeys.filter((key) => key !== transitionKey),
            }
          : group,
      ),
      roleMappings: current.roleMappings.map((mapping) =>
        mapping.groupKey === selectedGroup.key
          ? {
              ...mapping,
              transitionKeys: mapping.transitionKeys.filter((key) => key !== transitionKey),
            }
          : mapping,
      ),
    }));
  }

  function updateTransitionField(
    transitionKey: string,
    field: "fromStepKey" | "toStepKey",
    value: string,
  ) {
    setConfig((current) => ({
      ...current,
      transitions: current.transitions.map((transition) => {
        if (transition.key !== transitionKey) return transition;
        const nextTransition = { ...transition, [field]: value };
        return {
          ...nextTransition,
          name: buildTransitionName(
            nextTransition.fromStepKey,
            nextTransition.toStepKey,
            selectedSteps,
          ),
        };
      }),
    }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-500/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.92))]">
        <SectionCard title="" description="">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <select
                className={selectClassName}
                value={selectedGroup?.moduleKey || selectedGroupKey || ""}
                onChange={(event) => handlePageChange(event.target.value)}
              >
                <option value="">Select page</option>
                {pageOptions.map((option) => (
                  <option key={option.moduleKey} value={option.moduleKey}>
                    {option.name}
                  </option>
                ))}
              </select>
              <input
                className={inputClassName}
                value={newStatusName}
                onChange={(event) => setNewStatusName(event.target.value)}
                placeholder="New status"
              />
              <Button
                className="rounded-xl bg-sky-600 text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)] hover:bg-sky-500"
                onClick={addStatus}
                disabled={!selectedGroup || loading || saving}
              >
                <Plus className="mr-2 size-4" />
                Add status
              </Button>
              <Button
                className="rounded-xl bg-emerald-600 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-500"
                onClick={addRelationRow}
                disabled={!selectedGroup || loading || saving}
              >
                <Plus className="mr-2 size-4" />
                Add relation
              </Button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="overflow-hidden rounded-2xl border border-sky-500/20 bg-white/92 shadow-[0_12px_30px_rgba(14,165,233,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Statuses" tone="sky" />
                <div className="overflow-hidden">
                  <div className="grid grid-cols-[56px_1fr_72px] border-b border-sky-500/10 bg-sky-500/8 text-xs font-medium text-sky-700 dark:text-sky-300">
                    <div className="px-3 py-2">#</div>
                    <div className="px-3 py-2">Status</div>
                    <div className="px-3 py-2 text-center">...</div>
                  </div>
                  {selectedGroup ? (
                    selectedSteps.length ? (
                      selectedSteps.map((step, index) => (
                        <div
                          key={step.key}
                          className="grid grid-cols-[56px_1fr_72px] border-b border-border/50 bg-white/70 text-sm transition hover:bg-sky-500/[0.04] last:border-b-0 dark:bg-transparent"
                        >
                          <div className="px-3 py-3 font-medium text-sky-600 dark:text-sky-400">
                            {index + 1}
                          </div>
                          <div className="px-3 py-2">
                            <span className="inline-flex rounded-lg bg-sky-500/10 px-2.5 py-1 text-sky-700 dark:text-sky-300">
                              {step.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-center px-2 py-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-xl border-rose-500/15 bg-white/80 text-rose-700 hover:bg-rose-500/10 hover:text-rose-800 dark:bg-slate-900/80 dark:text-rose-300"
                              onClick={() => removeStatus(step.key)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyPanelText text="No status created for this page." />
                    )
                  ) : (
                    <EmptyPanelText text="Select a page first." />
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/92 shadow-[0_12px_30px_rgba(16,185,129,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Status relation" tone="emerald" />
                <div className="overflow-hidden">
                  <div className="grid grid-cols-[56px_1fr_1fr_72px] border-b border-emerald-500/10 bg-emerald-500/8 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <div className="px-3 py-2">#</div>
                    <div className="px-3 py-2">From status</div>
                    <div className="px-3 py-2">To status</div>
                    <div className="px-3 py-2 text-center">...</div>
                  </div>
                  {selectedGroup ? (
                    selectedGroupTransitions.length ? (
                      selectedGroupTransitions.map((transition, index) => (
                        <div
                          key={transition.key}
                          className="grid grid-cols-[56px_1fr_1fr_72px] border-b border-border/50 bg-white/70 text-sm transition hover:bg-emerald-500/[0.04] last:border-b-0 dark:bg-transparent"
                        >
                          <div className="px-3 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                            {index + 1}
                          </div>
                          <div className="px-3 py-2">
                            <select
                              className={rowSelectClassName}
                              value={transition.fromStepKey}
                              onChange={(event) =>
                                updateTransitionField(
                                  transition.key,
                                  "fromStepKey",
                                  event.target.value,
                                )
                              }
                            >
                              {selectedSteps.map((step) => (
                                <option key={step.key} value={step.key}>
                                  {step.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="px-3 py-2">
                            <select
                              className={rowSelectClassName}
                              value={transition.toStepKey}
                              onChange={(event) =>
                                updateTransitionField(
                                  transition.key,
                                  "toStepKey",
                                  event.target.value,
                                )
                              }
                            >
                              {selectedSteps.map((step) => (
                                <option key={step.key} value={step.key}>
                                  {step.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center justify-center px-2 py-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-xl border-rose-500/15 bg-white/80 text-rose-700 hover:bg-rose-500/10 hover:text-rose-800 dark:bg-slate-900/80 dark:text-rose-300"
                              onClick={() => removeRelationRow(transition.key)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyPanelText text="No status relation created for this page." />
                    )
                  ) : (
                    <EmptyPanelText text="Select a page first." />
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => void loadAll()}
                disabled={loading || saving}
              >
                <RefreshCw className="mr-2 size-4" />
                Refresh
              </Button>
              <Button
                className="rounded-xl bg-emerald-600 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-500"
                onClick={() => void saveAll()}
                disabled={loading || saving}
              >
                <Save className="mr-2 size-4" />
                Save
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function validateGroup(
  group: ApprovalHierarchyGroup,
  transitions: ApprovalHierarchyTransition[],
) {
  if (!group.stepKeys.length) {
    return "At least one status is required for the selected page.";
  }

  const availableStepKeys = new Set(group.stepKeys);
  const seen = new Set<string>();

  for (const transition of transitions) {
    if (!transition.fromStepKey || !transition.toStepKey) {
      return "Every relation needs both from and to status.";
    }
    if (!availableStepKeys.has(transition.fromStepKey) || !availableStepKeys.has(transition.toStepKey)) {
      return "Every relation must use statuses from the selected page.";
    }
    if (transition.fromStepKey === transition.toStepKey) {
      return "From status and to status cannot be the same.";
    }
    const relationKey = `${transition.fromStepKey}:${transition.toStepKey}`;
    if (seen.has(relationKey)) {
      return "Duplicate status relation found in this page.";
    }
    seen.add(relationKey);
  }

  return "";
}

function buildTransitionKey(groupKey: string) {
  return `${groupKey}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildTransitionName(
  fromStepKey: string,
  toStepKey: string,
  steps: ApprovalHierarchyStep[],
) {
  const fromName = steps.find((step) => step.key === fromStepKey)?.name || fromStepKey;
  const toName = steps.find((step) => step.key === toStepKey)?.name || toStepKey;
  return `${fromName} to ${toName}`;
}

function slugifyStatus(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || `status_${Date.now()}`
  );
}

function PanelHeader(props: { title: string; tone: "sky" | "emerald" }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.12)] ${
        props.tone === "sky"
          ? "bg-[linear-gradient(135deg,#0369a1,#0ea5e9)]"
          : "bg-[linear-gradient(135deg,#0f766e,#10b981)]"
      }`}
    >
      <span>{props.title}</span>
      <span className="size-4 rounded-full bg-white" />
    </div>
  );
}

function EmptyPanelText(props: { text: string }) {
  return <div className="text-muted-foreground px-4 py-5 text-sm">{props.text}</div>;
}

const selectClassName =
  "flex h-10 min-w-[220px] rounded-xl border border-emerald-500/20 bg-white/90 px-3 py-2 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:bg-slate-950/80";
const inputClassName =
  "flex h-10 min-w-[180px] rounded-xl border border-sky-500/20 bg-white/90 px-3 py-2 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:bg-slate-950/80";
const rowSelectClassName =
  "flex h-9 w-full rounded-xl border border-emerald-500/15 bg-white/90 px-3 py-2 text-sm dark:bg-slate-950/80";
