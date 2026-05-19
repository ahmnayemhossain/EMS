import * as React from "react";
import { Ellipsis, RefreshCw, Save } from "lucide-react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { Button } from "@/components/ui/primitives/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/primitives/dialog";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import {
  getApprovalHierarchy,
  saveApprovalHierarchy,
  type ApprovalHierarchyConfig,
  type ApprovalHierarchyRoleMapping,
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

export function RoleMappingSettingsModule() {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [config, setConfig] = React.useState<ApprovalHierarchyConfig>(emptyConfig);
  const [selectedGroupKey, setSelectedGroupKey] = React.useState("");
  const [roleEditorOpen, setRoleEditorOpen] = React.useState(false);
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const pageOptions = React.useMemo(() => listApprovalPageOptions(config), [config]);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const next = await getApprovalHierarchy(userId);
      setConfig(next);
      setSelectedGroupKey((current) => current || next.groups[0]?.moduleKey || next.groups[0]?.key || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load approval hierarchy.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectedGroup = config.groups.find((group) => group.moduleKey === selectedGroupKey) || config.groups.find((group) => group.key === selectedGroupKey) || null;
  const selectedGroupTransitionRows = React.useMemo(
    () => config.transitions.filter((transition) => selectedGroup?.transitionKeys.includes(transition.key)),
    [config.transitions, selectedGroup],
  );
  const selectedRole = config.roles.find((role) => role.id === selectedRoleId) || null;
  const selectedRoleMapping = selectedGroup && selectedRole
    ? getRoleMapping(config.roleMappings, selectedGroup.key, selectedRole.id)
    : null;

  function updateConfig(next: Partial<ApprovalHierarchyConfig>) {
    setConfig((current) => ({ ...current, ...next }));
  }

  async function saveAll() {
    try {
      setSaving(true);
      const next = await saveApprovalHierarchy(userId, config);
      setConfig(next);
      setSelectedGroupKey((current) => current || next.groups[0]?.moduleKey || next.groups[0]?.key || "");
      toast.success("Role mapping saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save role mapping.");
    } finally {
      setSaving(false);
    }
  }

  function openRoleEditor(roleId: string) {
    setSelectedRoleId(roleId);
    setRoleEditorOpen(true);
  }

  function handlePageChange(nextModuleKey: string) {
    setSelectedGroupKey(nextModuleKey);
    const option = pageOptions.find((item) => item.moduleKey === nextModuleKey);
    if (!option) {
      return;
    }
    setConfig((current) => ensureApprovalGroup(current, option).config);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-500/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.92))]">
        <SectionCard title="" description="">
          <div className="space-y-5">
            <div className="grid gap-1.5">
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
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/92 shadow-[0_12px_30px_rgba(16,185,129,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Status relation" />
                <div className="overflow-hidden">
                  <div className="grid grid-cols-[56px_1fr_1fr] border-b border-emerald-500/10 bg-emerald-500/8 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <div className="px-3 py-2">#</div>
                    <div className="px-3 py-2">From status</div>
                    <div className="px-3 py-2">To status</div>
                  </div>
                  {selectedGroup ? (
                    selectedGroupTransitionRows.length ? (
                      selectedGroupTransitionRows.map((transition, index) => (
                        <div key={transition.key} className="grid grid-cols-[56px_1fr_1fr] border-b border-border/50 bg-white/70 text-sm transition hover:bg-emerald-500/[0.04] last:border-b-0 dark:bg-transparent">
                          <div className="px-3 py-2 font-medium text-emerald-600 dark:text-emerald-400">{index + 1}</div>
                          <div className="px-3 py-2">
                            <span className="inline-flex rounded-lg bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
                              {readStepLabel(transition.fromStepKey, config)}
                            </span>
                          </div>
                          <div className="px-3 py-2">
                            <span className="inline-flex rounded-lg bg-sky-500/10 px-2.5 py-1 text-sky-700 dark:text-sky-300">
                              {readStepLabel(transition.toStepKey, config)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyPanelText text="No status relation available for this page." />
                    )
                  ) : (
                    <EmptyPanelText text="Select a page first." />
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-sky-500/20 bg-white/92 shadow-[0_12px_30px_rgba(14,165,233,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Roles" />
                <div className="overflow-hidden">
                  <div className="grid grid-cols-[56px_1fr_88px] border-b border-sky-500/10 bg-sky-500/8 text-xs font-medium text-sky-700 dark:text-sky-300">
                    <div className="px-3 py-2">#</div>
                    <div className="px-3 py-2">Name</div>
                    <div className="px-3 py-2 text-center">...</div>
                  </div>
                  {selectedGroup ? (
                    config.roles.length ? (
                      config.roles.map((role, index) => {
                        const mapping = getRoleMapping(config.roleMappings, selectedGroup.key, role.id);
                        return (
                          <div key={role.id} className="grid grid-cols-[56px_1fr_88px] border-b border-border/50 bg-white/70 text-sm transition hover:bg-sky-500/[0.04] last:border-b-0 dark:bg-transparent">
                            <div className="px-3 py-2 font-medium text-sky-600 dark:text-sky-400">{index + 1}</div>
                            <div className="px-3 py-2">
                              <div className="font-medium">{role.name}</div>
                              <div className="text-muted-foreground text-xs">{mapping.transitionKeys.length} relation(s)</div>
                            </div>
                            <div className="flex items-center justify-center px-2 py-1.5">
                              <Button variant="outline" size="icon" className="size-8 rounded-xl border-sky-500/15 bg-white/80 text-sky-700 hover:bg-sky-500/10 hover:text-sky-800 dark:bg-slate-900/80 dark:text-sky-300" onClick={() => openRoleEditor(role.id)}>
                                <Ellipsis className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyPanelText text="No roles found." />
                    )
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

      <Dialog open={roleEditorOpen} onOpenChange={setRoleEditorOpen}>
        <DialogContent className="overflow-hidden border-sky-500/20 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:bg-slate-950/95 sm:max-w-2xl">
          <DialogHeader className="border-b border-sky-500/10 bg-sky-500/[0.05]">
            <DialogTitle>{selectedRole?.name || "Role"} relation access</DialogTitle>
          </DialogHeader>
          {selectedGroup && selectedRole ? (
            <div className="grid gap-2 p-1">
              {selectedGroupTransitionRows.length ? (
                selectedGroupTransitionRows.map((transition) => {
                  const checked = selectedRoleMapping?.transitionKeys.includes(transition.key) || false;
                  return (
                    <label key={transition.key} className="flex items-center justify-between rounded-2xl border border-sky-500/10 bg-white/75 px-4 py-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:bg-sky-500/[0.04] dark:bg-slate-900/70">
                      <span>{readTransitionLabel(transition, config)}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          updateRoleTransitionKeys(
                            config.roleMappings,
                            selectedGroup.key,
                            selectedRole.id,
                            transition.key,
                            event.target.checked,
                            updateConfig,
                          )
                        }
                      />
                    </label>
                  );
                })
              ) : (
                <EmptyPanelText text="No relation found for this page." />
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setRoleEditorOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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

function getRoleMapping(
  roleMappings: ApprovalHierarchyRoleMapping[],
  groupKey: string,
  roleId: string,
) {
  return roleMappings.find((item) => item.groupKey === groupKey && item.roleId === roleId) || {
    groupKey,
    roleId,
    transitionKeys: [],
  };
}

function updateRoleTransitionKeys(
  roleMappings: ApprovalHierarchyRoleMapping[],
  groupKey: string,
  roleId: string,
  transitionKey: string,
  checked: boolean,
  setConfig: (next: Partial<ApprovalHierarchyConfig>) => void,
) {
  const existing = getRoleMapping(roleMappings, groupKey, roleId);
  const nextMapping = {
    ...existing,
    transitionKeys: checked
      ? Array.from(new Set([...existing.transitionKeys, transitionKey]))
      : existing.transitionKeys.filter((item) => item !== transitionKey),
  };
  const nextMappings = roleMappings
    .filter((item) => !(item.groupKey === groupKey && item.roleId === roleId))
    .concat(nextMapping.transitionKeys.length ? [nextMapping] : []);
  setConfig({ roleMappings: nextMappings });
}

function readTransitionLabel(
  transition: ApprovalHierarchyTransition,
  config: ApprovalHierarchyConfig,
) {
  return `${readStepLabel(transition.fromStepKey, config)} -> ${readStepLabel(transition.toStepKey, config)}`;
}

function readStepLabel(stepKey: string, config: ApprovalHierarchyConfig) {
  return config.steps.find((step) => step.key === stepKey)?.name || stepKey;
}

const selectClassName = "flex h-10 min-w-[220px] rounded-xl border border-emerald-500/20 bg-white/90 px-3 py-2 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:bg-slate-950/80";
