import * as React from "react";
import { RefreshCw } from "lucide-react";

import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { FilterBar } from "@/components/forms/FilterBar";
import { SearchInput } from "@/components/forms/SearchInput";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import { DataTable, type DataColumn } from "@/components/table/DataTable";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import {
  getApprovalHierarchy,
  saveApprovalHierarchy,
  type ApprovalHierarchyConfig,
  type ApprovalHierarchyStep,
} from "@/features/admin/settings/modules/services/approvalHierarchyApi";

const emptyConfig: ApprovalHierarchyConfig = {
  steps: [],
  transitions: [],
  groups: [],
  roleMappings: [],
  userMappings: [],
  roles: [],
};

type StatusRow = {
  key: string;
  name: string;
};

export function StatusStoreModule() {
  const { userId } = useUser();
  const [config, setConfig] = React.useState<ApprovalHierarchyConfig>(emptyConfig);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [createName, setCreateName] = React.useState("");
  const [createKey, setCreateKey] = React.useState("");
  const [selected, setSelected] = React.useState<StatusRow | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editKey, setEditKey] = React.useState("");

  const loadConfig = React.useCallback(async () => {
    try {
      setLoading(true);
      setConfig(await getApprovalHierarchy(userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load status store.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const rows = React.useMemo<StatusRow[]>(() => {
    const query = search.trim().toLowerCase();
    return config.steps
      .map((step) => ({ key: step.key, name: step.name }))
      .filter((row) =>
        query ? row.name.toLowerCase().includes(query) || row.key.includes(query) : true,
      )
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [config.steps, search]);

  const columns = React.useMemo<Array<DataColumn<StatusRow>>>(
    () => [
      { id: "name", header: "Status name", cell: (row) => row.name },
      {
        id: "key",
        header: "Key",
        cell: (row) => <span className="text-muted-foreground text-xs">{row.key}</span>,
      },
    ],
    [],
  );

  async function persist(nextConfig: ApprovalHierarchyConfig, message: string) {
    const saved = await saveApprovalHierarchy(userId, nextConfig);
    setConfig(saved);
    toast.success(message);
    return saved;
  }

  async function createStatus() {
    const name = createName.trim();
    const key = createKey.trim().toLowerCase();
    if (!name) {
      toast.error("Status name is required.");
      return;
    }
    if (!key) {
      toast.error("Status key is required.");
      return;
    }
    if (config.steps.some((step) => step.name.toLowerCase() === name.toLowerCase())) {
      toast.error("This status already exists.");
      return;
    }
    if (config.steps.some((step) => step.key === key)) {
      toast.error("This status key already exists.");
      return;
    }

    const nextStep: ApprovalHierarchyStep = {
      key,
      name,
      sortOrder: config.steps.length + 1,
      isActive: true,
      isInitial: false,
      isFinal: false,
    };

    await persist({ ...config, steps: [...config.steps, nextStep] }, "Status created");
    setCreateName("");
    setCreateKey("");
  }

  async function saveEdit() {
    if (!selected) return;
    const name = editName.trim();
    const key = editKey.trim().toLowerCase();
    if (!name) {
      toast.error("Status name is required.");
      return;
    }
    if (!key) {
      toast.error("Status key is required.");
      return;
    }
    if (
      config.steps.some(
        (step) => step.key !== selected.key && step.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      toast.error("This status already exists.");
      return;
    }
    if (config.steps.some((step) => step.key !== selected.key && step.key === key)) {
      toast.error("This status key already exists.");
      return;
    }

    const nextConfig: ApprovalHierarchyConfig = {
      ...config,
      steps: config.steps.map((step) =>
        step.key === selected.key ? { ...step, key, name } : step,
      ),
      transitions: config.transitions.map((transition) => ({
        ...transition,
        fromStepKey: transition.fromStepKey === selected.key ? key : transition.fromStepKey,
        toStepKey: transition.toStepKey === selected.key ? key : transition.toStepKey,
      })),
      groups: config.groups.map((group) => ({
        ...group,
        stepKeys: group.stepKeys.map((item) => (item === selected.key ? key : item)),
      })),
    };

    const saved = await persist(nextConfig, "Status updated");
    const nextSelected = saved.steps.find((step) => step.key === key);
    setSelected(nextSelected ? { key: nextSelected.key, name: nextSelected.name } : null);
    setEditName(nextSelected?.name || "");
    setEditKey(nextSelected?.key || "");
  }

  async function deleteSelected() {
    if (!selected) return;
    if (
      config.groups.some((group) => group.stepKeys.includes(selected.key)) ||
      config.transitions.some(
        (transition) =>
          transition.fromStepKey === selected.key || transition.toStepKey === selected.key,
      )
    ) {
      toast.error("This status is already used. Remove usage first.");
      return;
    }

    await persist(
      { ...config, steps: config.steps.filter((step) => step.key !== selected.key) },
      "Status deleted",
    );
    setSelected(null);
    setEditName("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadConfig()} disabled={loading}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <SectionCard title="" description="">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="grid flex-1 gap-1.5">
            <label className="text-sm font-medium">Status key</label>
            <Input
              value={createKey}
              onChange={(event) => setCreateKey(slugifyStatus(event.target.value))}
              placeholder="draft"
            />
          </div>
          <div className="grid flex-1 gap-1.5">
            <label className="text-sm font-medium">Status name</label>
            <Input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder="Draft"
            />
          </div>
          <Button onClick={() => void createStatus()}>Add status</Button>
        </div>
      </SectionCard>

      <FilterBar
        left={
          <div className="w-full sm:w-[360px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search statuses..." />
          </div>
        }
        onClear={() => setSearch("")}
      />

      <SectionCard title="Status store" description="Create and maintain approval status names.">
        {loading ? <div className="p-4 text-sm text-muted-foreground">Loading statuses...</div> : null}
        {!loading && rows.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No statuses found.</div> : null}
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.key}
          onRowClick={(row) => {
            setSelected(row);
            setEditKey(row.key);
            setEditName(row.name);
          }}
        />
      </SectionCard>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (open) return;
          setSelected(null);
          setEditName("");
        }}
        title="Edit status"
        description={selected?.name}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Status key</label>
              <Input value={editKey} onChange={(event) => setEditKey(slugifyStatus(event.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Status name</label>
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
            </div>
            <div className="grid gap-2 border-t pt-4 sm:grid-cols-2">
              <Button variant="destructive" onClick={() => void deleteSelected()}>
                Delete
              </Button>
              <Button onClick={() => void saveEdit()}>Save</Button>
            </div>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}

function slugifyStatus(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
