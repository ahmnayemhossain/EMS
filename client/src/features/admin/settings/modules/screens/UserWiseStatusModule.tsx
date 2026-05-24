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
  type ApprovalHierarchyTransition,
  type ApprovalHierarchyUserMapping,
} from "@/features/admin/settings/modules/services/approvalHierarchyApi";
import {
  listUsers,
  type UserInput,
} from "@/features/admin/settings/modules/services/usersApi";
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

export function UserWiseStatusModule() {
  const { userId } = useUser();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [config, setConfig] = React.useState<ApprovalHierarchyConfig>(emptyConfig);
  const [users, setUsers] = React.useState<UserInput[]>([]);
  const [selectedGroupKey, setSelectedGroupKey] = React.useState("");
  const [userEditorOpen, setUserEditorOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [userSearch, setUserSearch] = React.useState("");
  const pageOptions = React.useMemo(() => listApprovalPageOptions(config), [config]);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const [nextConfig, nextUsers] = await Promise.all([
        getApprovalHierarchy(userId),
        listUsers(userId),
      ]);
      setConfig(nextConfig);
      setUsers(nextUsers);
      setSelectedGroupKey(
        (current) => current || nextConfig.groups[0]?.moduleKey || nextConfig.groups[0]?.key || "",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load user wise status.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const effectiveConfig = React.useMemo(
    () => syncSelectedGroupTransitions(config, resolveSelectedGroup(config, selectedGroupKey)),
    [config, selectedGroupKey],
  );

  const selectedGroup =
    effectiveConfig.groups.find((group) => group.moduleKey === selectedGroupKey) ||
    effectiveConfig.groups.find((group) => group.key === selectedGroupKey) ||
    null;

  const selectedGroupTransitionRows = React.useMemo(
    () => buildLinearTransitionRows(effectiveConfig, selectedGroup),
    [effectiveConfig, selectedGroup],
  );

  const selectedUser =
    users.find((item) => String(item.id) === selectedUserId) || null;

  const selectedUserMapping =
    selectedGroup && selectedUser
      ? getUserMapping(effectiveConfig.userMappings, selectedGroup.key, selectedUser.id)
      : null;

  const userRows = React.useMemo(
    () =>
      [...users].sort((left, right) =>
        readUserName(left).localeCompare(readUserName(right)),
      ),
    [users],
  );

  const filteredUserRows = React.useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) {
      return userRows;
    }
    return userRows.filter((item) => {
      const name = readUserName(item).toLowerCase();
      const username = String(item.username || "").toLowerCase();
      const email = String(item.email || "").toLowerCase();
      const employeeId = String(item.employeeId || "").toLowerCase();
      return (
        name.includes(query) ||
        username.includes(query) ||
        email.includes(query) ||
        employeeId.includes(query)
      );
    });
  }, [userRows, userSearch]);

  function updateConfig(next: Partial<ApprovalHierarchyConfig>) {
    setConfig((current) => ({ ...current, ...next }));
  }

  async function saveAll() {
    try {
      setSaving(true);
      const next = await saveApprovalHierarchy(
        userId,
        effectiveConfig,
      );
      setConfig(next);
      setSelectedGroupKey(
        (current) => current || next.groups[0]?.moduleKey || next.groups[0]?.key || "",
      );
      toast.success("User wise status saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save user wise status.");
    } finally {
      setSaving(false);
    }
  }

  function openUserEditor(nextUserId: string) {
    setSelectedUserId(nextUserId);
    setUserEditorOpen(true);
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

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-emerald-500/20 bg-white/92 shadow-[0_10px_24px_rgba(16,185,129,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Status relation" />
                <div className="overflow-hidden">
                  <div className="grid grid-cols-[44px_1fr_1fr] border-b border-emerald-500/10 bg-emerald-500/8 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    <div className="px-2.5 py-2">#</div>
                    <div className="px-2.5 py-2">From status</div>
                    <div className="px-2.5 py-2">To status</div>
                  </div>
                  {selectedGroup ? (
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
                              {readStepLabel(transition.fromStepKey, config)}
                            </span>
                          </div>
                          <div className="px-2.5 py-2">
                            <span className="inline-flex rounded-md bg-sky-500/10 px-2 py-0.5 text-[12px] text-sky-700 dark:text-sky-300">
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

              <div className="overflow-hidden rounded-xl border border-sky-500/20 bg-white/92 shadow-[0_10px_24px_rgba(14,165,233,0.08)] backdrop-blur dark:bg-slate-950/70">
                <PanelHeader title="Users" />
                <div className="overflow-hidden">
                  <div className="border-b border-sky-500/10 bg-white/70 px-2.5 py-2 dark:bg-slate-950/40">
                    <input
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                      placeholder="Search user"
                      className="h-8 w-full rounded-lg border border-sky-500/15 bg-white/90 px-2.5 text-[12px] outline-none transition focus:border-sky-400 dark:bg-slate-900/80"
                    />
                  </div>
                  <div className="grid grid-cols-[44px_1fr_64px] border-b border-sky-500/10 bg-sky-500/8 text-[11px] font-medium text-sky-700 dark:text-sky-300">
                    <div className="px-2.5 py-2">#</div>
                    <div className="px-2.5 py-2">Name</div>
                    <div className="px-2.5 py-2 text-center">...</div>
                  </div>
                  {selectedGroup ? (
                    filteredUserRows.length ? (
                      filteredUserRows.map((item, index) => {
                        const mapping = getUserMapping(
                          effectiveConfig.userMappings,
                          selectedGroup.key,
                          item.id,
                        );
                        return (
                          <div
                            key={item.id}
                            className="grid grid-cols-[44px_1fr_64px] border-b border-border/50 bg-white/70 text-[13px] transition hover:bg-sky-500/[0.04] last:border-b-0 dark:bg-transparent"
                          >
                            <div className="px-2.5 py-2 font-medium text-sky-600 dark:text-sky-400">
                              {index + 1}
                            </div>
                            <div className="px-2.5 py-2">
                              <div className="font-medium">{readUserName(item)}</div>
                              <div className="text-muted-foreground text-[11px]">
                                {mapping.transitionKeys.length} relation(s)
                              </div>
                            </div>
                            <div className="flex items-center justify-center px-1.5 py-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-7 rounded-lg border-sky-500/15 bg-white/80 text-sky-700 hover:bg-sky-500/10 hover:text-sky-800 dark:bg-slate-900/80 dark:text-sky-300"
                                onClick={() => openUserEditor(String(item.id))}
                              >
                                <Ellipsis className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyPanelText text={userSearch ? "No users matched your search." : "No users found."} />
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

      <Dialog open={userEditorOpen} onOpenChange={setUserEditorOpen}>
        <DialogContent className="overflow-hidden border-sky-500/20 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:bg-slate-950/95 sm:max-w-2xl">
          <DialogHeader className="border-b border-sky-500/10 bg-sky-500/[0.05]">
            <DialogTitle>{selectedUser ? readUserName(selectedUser) : "User"} relation access</DialogTitle>
          </DialogHeader>
          {selectedGroup && selectedUser ? (
            <div className="grid gap-2 p-1">
              {selectedGroupTransitionRows.length ? (
                selectedGroupTransitionRows.map((transition) => {
                  const checked =
                    selectedUserMapping?.transitionKeys.includes(transition.key) || false;
                  return (
                    <label
                      key={transition.key}
                      className="flex items-center justify-between rounded-2xl border border-sky-500/10 bg-white/75 px-4 py-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:bg-sky-500/[0.04] dark:bg-slate-900/70"
                    >
                      <span>{readTransitionLabel(transition, config)}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          updateUserTransitionKeys(
                            effectiveConfig.userMappings,
                            selectedGroup.key,
                            selectedUser.id,
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
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setUserEditorOpen(false)}
            >
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

function getUserMapping(
  userMappings: ApprovalHierarchyUserMapping[],
  groupKey: string,
  userId: string,
) {
  return (
    userMappings.find(
      (item) => item.groupKey === groupKey && item.userId === String(userId),
    ) || {
      groupKey,
      userId: String(userId),
      transitionKeys: [],
    }
  );
}

function updateUserTransitionKeys(
  userMappings: ApprovalHierarchyUserMapping[],
  groupKey: string,
  userId: string,
  transitionKey: string,
  checked: boolean,
  setConfig: (next: Partial<ApprovalHierarchyConfig>) => void,
) {
  const existing = getUserMapping(userMappings, groupKey, userId);
  const nextMapping = {
    ...existing,
    transitionKeys: checked
      ? Array.from(new Set([...existing.transitionKeys, transitionKey]))
      : existing.transitionKeys.filter((item) => item !== transitionKey),
  };
  const nextMappings = userMappings
    .filter((item) => !(item.groupKey === groupKey && item.userId === String(userId)))
    .concat(nextMapping.transitionKeys.length ? [nextMapping] : []);
  setConfig({ userMappings: nextMappings });
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

function readUserName(user: UserInput) {
  return String(user.employeeName || user.username || user.email || "Unknown user");
}

function buildLinearTransitionRows(
  config: ApprovalHierarchyConfig,
  group: ApprovalHierarchyConfig["groups"][number] | null,
) {
  if (!group) {
    return [];
  }

  const rows: ApprovalHierarchyTransition[] = [];

  for (let index = 0; index < group.stepKeys.length - 1; index += 1) {
    const fromStepKey = group.stepKeys[index];
    const toStepKey = group.stepKeys[index + 1];
    const forward = config.transitions.find(
      (transition) =>
        transition.fromStepKey === fromStepKey &&
        transition.toStepKey === toStepKey,
    );
    const reverse = config.transitions.find(
      (transition) =>
        transition.fromStepKey === toStepKey &&
        transition.toStepKey === fromStepKey,
    );

    if (forward) {
      rows.push(forward);
    }
    if (reverse) {
      rows.push(reverse);
    }
  }

  return rows;
}

function syncSelectedGroupTransitions(
  config: ApprovalHierarchyConfig,
  group: ApprovalHierarchyConfig["groups"][number] | null,
) {
  if (!group) {
    return config;
  }

  const ensuredTransitions = [...config.transitions];

  for (let index = 0; index < group.stepKeys.length - 1; index += 1) {
    const fromStepKey = group.stepKeys[index];
    const toStepKey = group.stepKeys[index + 1];
    ensureTransition(ensuredTransitions, config, fromStepKey, toStepKey);
    ensureTransition(ensuredTransitions, config, toStepKey, fromStepKey);
  }

  const nextGroup = {
    ...group,
    transitionKeys: buildLinearTransitionRows(
      { ...config, transitions: ensuredTransitions },
      { ...group, transitionKeys: ensuredTransitions.map((transition) => transition.key) },
    ).map((transition) => transition.key),
  };

  return {
    ...config,
    transitions: ensuredTransitions,
    groups: config.groups.map((item) =>
      item.key === group.key ? nextGroup : item,
    ),
  };
}

function resolveSelectedGroup(
  config: ApprovalHierarchyConfig,
  selectedGroupKey: string,
) {
  return (
    config.groups.find((group) => group.moduleKey === selectedGroupKey) ||
    config.groups.find((group) => group.key === selectedGroupKey) ||
    null
  );
}

function ensureTransition(
  transitions: ApprovalHierarchyTransition[],
  config: ApprovalHierarchyConfig,
  fromStepKey: string,
  toStepKey: string,
) {
  const existing = transitions.find(
    (transition) =>
      transition.fromStepKey === fromStepKey && transition.toStepKey === toStepKey,
  );
  if (existing) {
    return existing;
  }

  const fromName = readStepLabel(fromStepKey, config);
  const toName = readStepLabel(toStepKey, config);
  const nextTransition: ApprovalHierarchyTransition = {
    key: `${fromStepKey}_to_${toStepKey}`,
    name: `${fromName} to ${toName}`,
    fromStepKey,
    toStepKey,
    isActive: true,
  };
  transitions.push(nextTransition);
  return nextTransition;
}

const selectClassName =
  "flex h-9 min-w-[220px] max-w-[280px] rounded-xl border border-emerald-500/20 bg-white/90 px-3 py-2 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:bg-slate-950/80";
