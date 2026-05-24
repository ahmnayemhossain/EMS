import * as React from "react";
import { ChevronDown, ChevronUp, Plus, RefreshCw } from "lucide-react";

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/primitives/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
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

export function PageWiseStatusModule() {
  const { userId } = useUser();
  const [config, setConfig] = React.useState<ApprovalHierarchyConfig>(emptyConfig);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedModuleKey, setSelectedModuleKey] = React.useState("");
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const pageOptions = React.useMemo(() => listApprovalPageOptions(config), [config]);

  const loadConfig = React.useCallback(async () => {
    try {
      setLoading(true);
      const next = await getApprovalHierarchy(userId);
      setConfig(next);
      setSelectedModuleKey(
        (current) => current || next.groups[0]?.moduleKey || "",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load page wise status.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const selectedGroup =
    config.groups.find((group) => group.moduleKey === selectedModuleKey) || null;

  const selectedSteps = React.useMemo(
    () =>
      (selectedGroup?.stepKeys ?? [])
        .map((stepKey) => config.steps.find((step) => step.key === stepKey))
        .filter(Boolean) as ApprovalHierarchyStep[],
    [config.steps, selectedGroup],
  );

  const availableSteps = React.useMemo(
    () =>
      config.steps.filter(
        (step) => !(selectedGroup?.stepKeys ?? []).includes(step.key),
      ),
    [config.steps, selectedGroup],
  );

  function handlePageChange(moduleKey: string) {
    setSelectedModuleKey(moduleKey);
    const option = pageOptions.find((item) => item.moduleKey === moduleKey);
    if (!option) return;
    setConfig((current) => ensureApprovalGroup(current, option).config);
  }

  function updateGroup(nextGroup: ApprovalHierarchyGroup) {
    setConfig((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.key === nextGroup.key ? nextGroup : group,
      ),
    }));
  }

  function addStatusToPage(stepKey: string) {
    if (!selectedGroup) return;
    updateGroup({ ...selectedGroup, stepKeys: [...selectedGroup.stepKeys, stepKey] });
  }

  function removeStatusFromPage(stepKey: string) {
    if (!selectedGroup) return;
    const blocked = config.transitions.some(
      (transition) =>
        selectedGroup.transitionKeys.includes(transition.key) &&
        (transition.fromStepKey === stepKey || transition.toStepKey === stepKey),
    );
    if (blocked) {
      toast.error("This status is already used in this page’s relations. Remove those relations first.");
      return;
    }
    updateGroup({
      ...selectedGroup,
      stepKeys: selectedGroup.stepKeys.filter((item) => item !== stepKey),
    });
  }

  function moveStatus(stepKey: string, direction: "up" | "down") {
    if (!selectedGroup) return;
    const currentIndex = selectedGroup.stepKeys.indexOf(stepKey);
    if (currentIndex < 0) return;
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= selectedGroup.stepKeys.length) return;
    const nextStepKeys = [...selectedGroup.stepKeys];
    [nextStepKeys[currentIndex], nextStepKeys[nextIndex]] = [
      nextStepKeys[nextIndex],
      nextStepKeys[currentIndex],
    ];
    updateGroup({ ...selectedGroup, stepKeys: nextStepKeys });
  }

  async function saveAll() {
    try {
      setSaving(true);
      const next = await saveApprovalHierarchy(userId, config);
      setConfig(next);
      toast.success("Page wise status saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save page wise status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadConfig()} disabled={loading || saving}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <SectionCard title="Page wise status" description="Assign statuses to each page and maintain their order.">
        <div className="space-y-4">
          <select
            className="flex h-10 min-w-[240px] rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            value={selectedModuleKey}
            onChange={(event) => handlePageChange(event.target.value)}
          >
            <option value="">Select page</option>
            {pageOptions.map((option) => (
              <option key={option.moduleKey} value={option.moduleKey}>
                {option.name}
              </option>
            ))}
          </select>

          {selectedGroup ? (
            <div className="space-y-4">
              <div className="flex justify-start">
                <StatusPicker
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                  rows={availableSteps}
                  onSelect={(step) => {
                    addStatusToPage(step.key);
                    setPickerOpen(false);
                  }}
                />
              </div>
              <SelectedStatusList
                title="Selected status"
                rows={selectedSteps}
                emptyText="No status selected for this page."
                onRemove={(step) => removeStatusFromPage(step.key)}
                onMoveUp={(step) => moveStatus(step.key, "up")}
                onMoveDown={(step) => moveStatus(step.key, "down")}
              />
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">Select a page first.</div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => void saveAll()} disabled={loading || saving || !selectedGroup}>
              Save
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function StatusPicker(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: ApprovalHierarchyStep[];
  onSelect: (step: ApprovalHierarchyStep) => void;
}) {
  return (
    <Popover open={props.open} onOpenChange={props.onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          <Plus className="mr-2 size-4" />
          Add status
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Search status..." />
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            {props.rows.map((step) => (
              <CommandItem key={step.key} value={`${step.name} ${step.key}`} onSelect={() => props.onSelect(step)}>
                <div className="min-w-0">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-muted-foreground text-xs">{step.key}</div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SelectedStatusList(props: {
  title: string;
  rows: ApprovalHierarchyStep[];
  emptyText: string;
  onRemove: (step: ApprovalHierarchyStep) => void;
  onMoveUp: (step: ApprovalHierarchyStep) => void;
  onMoveDown: (step: ApprovalHierarchyStep) => void;
}) {
  return (
    <div className="rounded-xl border">
      <div className="border-b px-4 py-3 text-sm font-semibold">{props.title}</div>
      <div className="divide-y">
        {props.rows.length ? (
          props.rows.map((step, index) => (
            <div key={step.key} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <div className="font-medium">{step.name}</div>
                <div className="text-muted-foreground text-xs">{step.key}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => props.onMoveUp(step)} disabled={index === 0}>
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => props.onMoveDown(step)}
                  disabled={index === props.rows.length - 1}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => props.onRemove(step)}>
                  Remove
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground px-4 py-4 text-sm">{props.emptyText}</div>
        )}
      </div>
    </div>
  );
}

