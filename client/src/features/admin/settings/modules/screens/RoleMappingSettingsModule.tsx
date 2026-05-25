import * as React from "react";
import { Ellipsis, RefreshCw, Save } from "lucide-react";

import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { Button } from "@/components/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/primitives/dialog";
import {
  getApprovalHierarchy,
  saveApprovalHierarchy,
  type ApprovalHierarchyConfig,
  type ApprovalHierarchyRoleMapping,
  type ApprovalHierarchyTransition,
} from "@/features/admin/settings/modules/services/approvalHierarchyApi";
import {
  ensureApprovalGroup,
  listApprovalPageOptions,
} from "@/features/admin/settings/modules/screens/approval-pages";
import {
  buildApprovalConfigForSave,
  buildLinearApprovalTransitions,
  readApprovalStepLabel,
  resolveApprovalGroup,
} from "@/features/admin/settings/modules/screens/approval-workflow";

const emptyConfig: ApprovalHierarchyConfig = {
  steps: [],
  transitions: [],
  groups: [],
  roleMappings: [],
  userMappings: [],
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
  const [roleSearch, setRoleSearch] = React.useState("");
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
      toast.error(error instanceof Error ? error.message : "Could not load role wise status.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectedGroup = React.useMemo(
    () => resolveApprovalGroup(config, selectedGroupKey),
    [config, selectedGroupKey],
  );
  const effectiveConfig = React.useMemo(
    () => buildApprovalConfigForSave(config, selectedGroup),
    [config, selectedGroup],
  );

  const effectiveGroup = React.useMemo(
    () => resolveApprovalGroup(effectiveConfig, selectedGroupKey),
    [effectiveConfig, selectedGroupKey],
  );

  const selectedGroupTransitionRows = React.useMemo(
    () => buildLinearApprovalTransitions(effectiveConfig, effectiveGroup),
    [effectiveConfig, effectiveGroup],
  );

  const selectedRole =
    effectiveConfig.roles.find((role) => role.id === selectedRoleId) || null;

  const selectedRoleMapping =
    effectiveGroup && selectedRole
      ? getRoleMapping(effectiveConfig.roleMappings, effectiveGroup.key, selectedRole.id)
      : null;

  const roleRows = React.useMemo(
    () => [...effectiveConfig.roles].sort((left, right) => left.name.localeCompare(right.name)),
    [effectiveConfig.roles],
  );

  const filteredRoleRows = React.useMemo(() => {
    const query = roleSearch.trim().toLowerCase();
    if (!query) {
      return roleRows;
    }
    return roleRows.filter((role) => role.name.toLowerCase().includes(query));
  }, [roleRows, roleSearch]);

  function updateConfig(next: Partial<ApprovalHierarchyConfig>) {
    setConfig((current) => ({ ...current, ...next }));
  }

  async function saveAll() {
    try {
      setSaving(true);
      const next = await saveApprovalHierarchy(userId, effectiveConfig);
      setConfig(next);
      setSelectedGroupKey(
        (current) => current || next.groups[0]?.moduleKey || next.groups[0]?.key || "",
      );
      toast.success("Role wise status saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save role wise status.");
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
      <div className="mx-auto max-w-5xl rounded-2xl border border-emerald-500/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.92))]">
        <SectionCard title="" description="">
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <select
                className={selectClassName}
                value={effectiveGroup?.moduleKey || selectedGroupKey || ""}
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

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-white/92 shadow-[0_10px_24px_rgba(16,185,129,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Status relation" />
                <div className="overflow-hidden">
                  <div className="grid grid-cols-[44px_1fr_1fr] border-b border-emerald-500/10 bg-emerald-500/8 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    <div className="px-2.5 py-2">#</div>
                    <div className="px-2.5 py-2">From status</div>
                    <div className="px-2.5 py-2">To status</div>
                  </div>
                  {effectiveGroup ? (
                    selectedGroupTransitionRows.length ? (
                      selectedGroupTransitionRows.map((transition, index) => (
                        <div
                          key={transition.key}
                          className="grid grid-cols-[44px_1fr_1fr] border-b border-border/50 bg-white/70 text-[13px] transition hover:bg-emerald-500/[0.04] last:border-b-0 dark:bg-transparent"
                        >
                          <div className="px-2.5 py-2 font-medium text-emerald-600 dark:text-emerald-400">
                            {index + 1}
                          </div>
                          <div className="px-2.5 py-2">
                            <span className="inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-[12px] text-emerald-700 dark:text-emerald-300">
                              {readApprovalStepLabel(transition.fromStepKey, effectiveConfig)}
                            </span>
                          </div>
                          <div className="px-2.5 py-2">
                            <span className="inline-flex rounded-md bg-sky-500/10 px-2 py-0.5 text-[12px] text-sky-700 dark:text-sky-300">
                              {readApprovalStepLabel(transition.toStepKey, effectiveConfig)}
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

              <div className="overflow-hidden rounded-xl border border-sky-500/20 bg-white/92 shadow-[0_10px_24px_rgba(14,165,233,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Roles" />
                <div className="overflow-hidden">
                  <div className="border-b border-sky-500/10 bg-white/70 px-2.5 py-2 dark:bg-slate-950/40">
                    <input
                      value={roleSearch}
                      onChange={(event) => setRoleSearch(event.target.value)}
                      placeholder="Search role"
                      className="h-8 w-full rounded-lg border border-sky-500/15 bg-white/90 px-2.5 text-[12px] outline-none transition focus:border-sky-400 dark:bg-slate-900/80"
                    />
                  </div>
                  <div className="grid grid-cols-[44px_1fr_64px] border-b border-sky-500/10 bg-sky-500/8 text-[11px] font-medium text-sky-700 dark:text-sky-300">
                    <div className="px-2.5 py-2">#</div>
                    <div className="px-2.5 py-2">Name</div>
                    <div className="px-2.5 py-2 text-center">...</div>
                  </div>
                  {effectiveGroup ? (
                    filteredRoleRows.length ? (
                      filteredRoleRows.map((role, index) => {
                      const mapping = getRoleMapping(
                          effectiveConfig.roleMappings,
                          effectiveGroup.key,
                          role.id,
                        );
                        return (
                          <div
                            key={role.id}
                            className="grid grid-cols-[44px_1fr_64px] border-b border-border/50 bg-white/70 text-[13px] transition hover:bg-sky-500/[0.04] last:border-b-0 dark:bg-transparent"
                          >
                            <div className="px-2.5 py-2 font-medium text-sky-600 dark:text-sky-400">
                              {index + 1}
                            </div>
                            <div className="px-2.5 py-2">
                              <div className="font-medium">{role.name}</div>
                              <div className="text-muted-foreground text-[11px]">
                                {mapping.transitionKeys.length} relation(s)
                              </div>
                            </div>
                            <div className="flex items-center justify-center px-1.5 py-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-7 rounded-lg border-sky-500/15 bg-white/80 text-sky-700 hover:bg-sky-500/10 hover:text-sky-800 dark:bg-slate-900/80 dark:text-sky-300"
                                onClick={() => openRoleEditor(role.id)}
                              >
                                <Ellipsis className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyPanelText
                        text={roleSearch ? "No roles matched your search." : "No roles found."}
                      />
                    )
                  ) : (
                    <EmptyPanelText text="Select a page first." />
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2.5">
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

      <Dialog open={roleEditorOpen} onOpenChange={setRoleEditorOpen}>
        <DialogContent className="overflow-hidden border-sky-500/20 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:bg-slate-950/95 sm:max-w-2xl">
          <DialogHeader className="border-b border-sky-500/10 bg-sky-500/[0.05]">
            <DialogTitle>{selectedRole?.name || "Role"} relation access</DialogTitle>
          </DialogHeader>
          {effectiveGroup && selectedRole ? (
            <div className="grid gap-2 p-1">
              {selectedGroupTransitionRows.length ? (
                selectedGroupTransitionRows.map((transition) => {
                  const checked =
                    selectedRoleMapping?.transitionKeys.includes(transition.key) || false;
                  return (
                    <label
                      key={transition.key}
                      className="flex items-center justify-between rounded-2xl border border-sky-500/10 bg-white/75 px-4 py-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:bg-sky-500/[0.04] dark:bg-slate-900/70"
                    >
                      <span>{readTransitionLabel(transition, effectiveConfig)}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          updateRoleTransitionKeys(
                            effectiveConfig.roleMappings,
                            effectiveGroup.key,
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
            <Button variant="outline" className="rounded-xl" onClick={() => setRoleEditorOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PanelHeader(props: { title: string }) {
  return (
    <div className="flex items-center justify-between bg-[linear-gradient(135deg,#0f766e,#10b981)] px-3 py-2.5 text-[13px] font-semibold text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.12)]">
      <span>{props.title}</span>
      <span className="size-3.5 rounded-full bg-white" />
    </div>
  );
}

function EmptyPanelText(props: { text: string }) {
  return <div className="text-muted-foreground px-3 py-4 text-[13px]">{props.text}</div>;
}

function getRoleMapping(
  roleMappings: ApprovalHierarchyRoleMapping[],
  groupKey: string,
  roleId: string,
) {
  return (
    roleMappings.find((item) => item.groupKey === groupKey && item.roleId === roleId) || {
      groupKey,
      roleId,
      transitionKeys: [],
    }
  );
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
  return `${readApprovalStepLabel(transition.fromStepKey, config)} -> ${readApprovalStepLabel(transition.toStepKey, config)}`;
}

const selectClassName =
  "flex h-9 min-w-[220px] max-w-[280px] rounded-xl border border-emerald-500/20 bg-white/90 px-3 py-2 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:bg-slate-950/80";
