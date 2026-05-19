import * as React from "react";
import { Plus, RefreshCw, Save, Trash2 } from "lucide-react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { Button } from "@/components/ui/primitives/button";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import {
  getApprovalHierarchy,
  saveApprovalHierarchy,
  type ApprovalHierarchyConfig,
  type ApprovalHierarchyStep,
  type ApprovalHierarchyTransition,
} from "@/features/admin/settings/modules/services/approvalHierarchyApi";
import { ensureApprovalGroup, listApprovalPageOptions } from "@/features/admin/settings/modules/screens/approval-pages";

const emptyConfig: ApprovalHierarchyConfig = {
  steps: [],
  transitions: [],
  groups: [],
  roleMappings: [],
  roles: [],
};

export function StatusRelationsSettingsModule() {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [config, setConfig] = React.useState<ApprovalHierarchyConfig>(emptyConfig);
  const [selectedGroupKey, setSelectedGroupKey] = React.useState("");
  const pageOptions = React.useMemo(() => listApprovalPageOptions(config), [config]);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const next = await getApprovalHierarchy(userId);
      setConfig(next);
      setSelectedGroupKey((current) => current || next.groups[0]?.moduleKey || next.groups[0]?.key || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load status relations.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectedGroup = config.groups.find((group) => group.moduleKey === selectedGroupKey) || config.groups.find((group) => group.key === selectedGroupKey) || null;
  const selectedGroupTransitions = React.useMemo(
    () => config.transitions.filter((transition) => selectedGroup?.transitionKeys.includes(transition.key)),
    [config.transitions, selectedGroup],
  );
  const selectedStepKeys = React.useMemo(() => {
    const keys = new Set<string>();
    for (const transition of selectedGroupTransitions) {
      keys.add(transition.fromStepKey);
      keys.add(transition.toStepKey);
    }
    return Array.from(keys);
  }, [selectedGroupTransitions]);
  const activeSteps = React.useMemo(
    () => config.steps.filter((step) => step.isActive).sort((left, right) => left.sortOrder - right.sortOrder),
    [config.steps],
  );

  async function saveAll() {
    if (!selectedGroup) {
      toast.error("Select a page first.");
      return;
    }
    const validationError = validateTransitions(selectedGroupTransitions);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      setSaving(true);
      const next = await saveApprovalHierarchy(userId, config);
      setConfig(next);
      setSelectedGroupKey((current) => current || next.groups[0]?.moduleKey || next.groups[0]?.key || "");
      toast.success("Status relations saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save status relations.");
    } finally {
      setSaving(false);
    }
  }

  function addRelationRow() {
    if (!selectedGroup) {
      toast.error("Select a page first.");
      return;
    }
    const fallbackFrom = activeSteps[0]?.key || "draft";
    const fallbackTo = activeSteps[1]?.key || activeSteps[0]?.key || "submitted";
    const nextTransition: ApprovalHierarchyTransition = {
      key: buildTransitionKey(selectedGroup.key),
      name: buildTransitionName(fallbackFrom, fallbackTo, config.steps),
      fromStepKey: fallbackFrom,
      toStepKey: fallbackTo,
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

  function handlePageChange(nextModuleKey: string) {
    setSelectedGroupKey(nextModuleKey);
    const option = pageOptions.find((item) => item.moduleKey === nextModuleKey);
    if (!option) {
      return;
    }
    setConfig((current) => ensureApprovalGroup(current, option).config);
  }

  function removeRelationRow(transitionKey: string) {
    if (!selectedGroup) {
      return;
    }
    setConfig((current) => ({
      ...current,
      transitions: current.transitions.filter((transition) => transition.key !== transitionKey),
      groups: current.groups.map((group) =>
        group.key === selectedGroup.key
          ? { ...group, transitionKeys: group.transitionKeys.filter((key) => key !== transitionKey) }
          : group,
      ),
      roleMappings: current.roleMappings.map((mapping) =>
        mapping.groupKey === selectedGroup.key
          ? { ...mapping, transitionKeys: mapping.transitionKeys.filter((key) => key !== transitionKey) }
          : mapping,
      ),
    }));
  }

  function updateTransitionField(transitionKey: string, field: "fromStepKey" | "toStepKey", value: string) {
    setConfig((current) => ({
      ...current,
      transitions: current.transitions.map((transition) => {
        if (transition.key !== transitionKey) {
          return transition;
        }
        const nextTransition = { ...transition, [field]: value };
        return {
          ...nextTransition,
          name: buildTransitionName(nextTransition.fromStepKey, nextTransition.toStepKey, current.steps),
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
              <Button className="rounded-xl bg-emerald-600 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-500" onClick={addRelationRow} disabled={!selectedGroup || loading || saving}>
                <Plus className="mr-2 size-4" />
                Add relation
              </Button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/92 shadow-[0_12px_30px_rgba(16,185,129,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Status relation" />
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
                        <div key={transition.key} className="grid grid-cols-[56px_1fr_1fr_72px] border-b border-border/50 bg-white/70 text-sm transition hover:bg-emerald-500/[0.04] last:border-b-0 dark:bg-transparent">
                          <div className="px-3 py-3 font-medium text-emerald-600 dark:text-emerald-400">{index + 1}</div>
                          <div className="px-3 py-2">
                            <select
                              className={rowSelectClassName}
                              value={transition.fromStepKey}
                              onChange={(event) => updateTransitionField(transition.key, "fromStepKey", event.target.value)}
                            >
                              {activeSteps.map((step) => (
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
                              onChange={(event) => updateTransitionField(transition.key, "toStepKey", event.target.value)}
                            >
                              {activeSteps.map((step) => (
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

              <div className="overflow-hidden rounded-2xl border border-sky-500/20 bg-white/92 shadow-[0_12px_30px_rgba(14,165,233,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Statuses" />
                <div className="space-y-3 px-4 py-4">
                  {selectedGroup ? (
                    <>
                      <div className="text-muted-foreground text-sm">These statuses are available for relation setup on the selected page.</div>
                      <div className="flex flex-wrap gap-2">
                        {activeSteps.map((step) => {
                          const selected = selectedStepKeys.includes(step.key);
                          return (
                            <span
                              key={step.key}
                              className={selected
                                ? "inline-flex rounded-xl bg-emerald-500/12 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"
                                : "inline-flex rounded-xl bg-slate-500/10 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300"}
                            >
                              {step.name}
                            </span>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <EmptyPanelText text="Select a page first." />
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => void loadAll()} disabled={loading || saving}>
                <RefreshCw className="mr-2 size-4" />
                Refresh
              </Button>
              <Button className="rounded-xl bg-emerald-600 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-500" onClick={() => void saveAll()} disabled={loading || saving}>
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

function validateTransitions(transitions: ApprovalHierarchyTransition[]) {
  const seen = new Set<string>();
  for (const transition of transitions) {
    if (!transition.fromStepKey || !transition.toStepKey) {
      return "Every relation needs both from and to status.";
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

function buildTransitionName(fromStepKey: string, toStepKey: string, steps: ApprovalHierarchyStep[]) {
  const fromName = steps.find((step) => step.key === fromStepKey)?.name || fromStepKey;
  const toName = steps.find((step) => step.key === toStepKey)?.name || toStepKey;
  return `${fromName} to ${toName}`;
}

function PanelHeader(props: { title: string }) {
  return (
    <div className="flex items-center justify-between bg-[linear-gradient(135deg,#0f766e,#10b981)] px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.12)]">
      <span>{props.title}</span>
      <span className="size-4 rounded-full bg-white" />
    </div>
  );
}

function EmptyPanelText(props: { text: string }) {
  return <div className="text-muted-foreground px-4 py-5 text-sm">{props.text}</div>;
}

const selectClassName = "flex h-10 min-w-[220px] rounded-xl border border-emerald-500/20 bg-white/90 px-3 py-2 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:bg-slate-950/80";
const rowSelectClassName = "flex h-9 w-full rounded-xl border border-emerald-500/15 bg-white/90 px-3 py-2 text-sm dark:bg-slate-950/80";
