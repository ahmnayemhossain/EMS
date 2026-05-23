import { RefreshCw } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import { Textarea } from "@/components/ui/primitives/textarea";
import { toast } from "@/core/app/lib/toast";
import { useUser } from "@/core/app/state/slices/user";
import { CreateActionDialog } from "@/components/layout/primitives/CreateActionDialog";
import { DetailPanel } from "@/components/layout/primitives/DetailPanel";
import { SectionCard } from "@/components/layout/primitives/SectionCard";
import type { DataColumn } from "@/components/table/DataTable";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { DeleteConfirm } from "@/features/admin/settings/modules/users/delete-confirm";
import {
  createDashboardWidget,
  deleteDashboardWidget,
  listDashboardWidgets,
  type DashboardWidgetEntity,
  updateDashboardWidget,
} from "@/features/admin/settings/modules/services/dashboardWidgetsApi";
import {
  dashboardWidgetPresets,
  getDashboardWidgetPreset,
} from "@/features/overview/dashboard/config/widget-presets";

type WidgetDraft = Omit<DashboardWidgetEntity, "id">;

export function DashboardWidgetsModule() {
  const { userId } = useUser();
  const [rows, setRows] = React.useState<DashboardWidgetEntity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDraft, setCreateDraft] = React.useState<WidgetDraft>(blankDraft());
  const [selected, setSelected] = React.useState<DashboardWidgetEntity | null>(null);
  const [editDraft, setEditDraft] = React.useState<DashboardWidgetEntity | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const loadRows = React.useCallback(async () => {
    try {
      setLoading(true);
      setRows(await listDashboardWidgets(userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load dashboard widgets.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const columns = React.useMemo<Array<DataColumn<DashboardWidgetEntity>>>(
    () => [
      {
        id: "widget",
        header: "Widget",
        cell: (row) => {
          const preset = getDashboardWidgetPreset(row.templateKey);
          return (
            <div className="min-w-0">
              <div className="truncate font-medium">{row.name}</div>
              <div className="text-muted-foreground mt-1 text-xs">
                {preset?.name || row.templateKey}
              </div>
            </div>
          );
        },
      },
      {
        id: "size",
        header: "Default size",
        cell: (row) => (
          <div className="text-sm">
            {row.defaultSpan}w × {row.defaultRows}h
          </div>
        ),
        className: "w-[140px]",
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => (
          <StatusBadge tone={row.status === 1 ? "compliant" : "warning"}>
            {row.status === 1 ? "Active" : "Inactive"}
          </StatusBadge>
        ),
        className: "w-[140px]",
      },
    ],
    [],
  );

  const activeEditDraft = editDraft || selected;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => void loadRows()} disabled={loading}>
          <RefreshCw className="size-4" />
        </Button>
        <CreateActionDialog
          title="Create dashboard widget"
          triggerLabel="Create dashboard widget"
          triggerVariant="floating"
          submitLabel="Create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          contentClassName="sm:max-w-2xl"
          onCreate={async () => {
            const errors = validateDraft(createDraft, rows);
            if (errors.length) {
              toast.error(errors[0]);
              return false;
            }
            try {
              const created = await createDashboardWidget(createDraft, userId);
              setRows((current) => [created, ...current]);
              setCreateDraft(blankDraft());
              toast.success("Dashboard widget created");
              return true;
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Create failed");
              return false;
            }
          }}
        >
          <DashboardWidgetForm value={createDraft} onChange={setCreateDraft} />
        </CreateActionDialog>
      </div>

      <SectionCard
        title="Dashboard widgets"
        description="Create reusable widgets from simple presets. These become available inside dashboard containers."
      >
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading dashboard widgets...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No dashboard widget configured yet.
          </div>
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(row) => row.id}
            onRowClick={(row) => {
              setSelected(row);
              setEditDraft(null);
              setConfirmDelete(false);
            }}
          />
        )}
      </SectionCard>

      <DetailPanel
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (open) return;
          setSelected(null);
          setEditDraft(null);
          setConfirmDelete(false);
        }}
        title={editDraft ? "Edit dashboard widget" : "Dashboard widget"}
        description={selected?.name}
        overlay={
          selected && confirmDelete ? (
            <DeleteConfirm
              label={selected.name}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={async () => {
                try {
                  await deleteDashboardWidget(selected.id, userId);
                  setRows((current) => current.filter((item) => item.id !== selected.id));
                  setConfirmDelete(false);
                  setEditDraft(null);
                  setSelected(null);
                  toast.success("Dashboard widget deleted");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Delete failed");
                }
              }}
            />
          ) : null
        }
      >
        {activeEditDraft ? (
          <div className="space-y-4">
            <DashboardWidgetForm
              value={activeEditDraft}
              disabled={!editDraft}
              onChange={(value) =>
                setEditDraft({ ...(editDraft || selected!), ...value })
              }
            />
            <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
              {editDraft ? (
                <Button variant="outline" onClick={() => setEditDraft(null)}>
                  Cancel
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              )}
              {editDraft ? (
                <Button
                  onClick={async () => {
                    if (!editDraft) return;
                    const errors = validateDraft(editDraft, rows, selected?.id);
                    if (errors.length) {
                      toast.error(errors[0]);
                      return;
                    }
                    try {
                      const updated = await updateDashboardWidget(editDraft, userId);
                      setRows((current) =>
                        current.map((item) => (item.id === updated.id ? updated : item)),
                      );
                      setSelected(updated);
                      setEditDraft(null);
                      toast.success("Dashboard widget saved");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Save failed");
                    }
                  }}
                >
                  Save
                </Button>
              ) : (
                <Button onClick={() => setEditDraft(selected)}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}

function DashboardWidgetForm({
  value,
  disabled = false,
  onChange,
}: {
  value: WidgetDraft | DashboardWidgetEntity;
  disabled?: boolean;
  onChange: (value: WidgetDraft | DashboardWidgetEntity) => void;
}) {
  const preset = getDashboardWidgetPreset(value.templateKey);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="grid gap-2">
        <span className="text-sm font-medium">Display name</span>
        <Input
          disabled={disabled}
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder="Utility overview"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">Preset</span>
        <Select
          disabled={disabled}
          value={value.templateKey}
          onValueChange={(nextValue) => {
            const nextPreset = getDashboardWidgetPreset(nextValue);
            if (!nextPreset) return;
            onChange({
              ...value,
              templateKey: nextPreset.key,
              description: nextPreset.description,
              defaultSpan: nextPreset.defaultSpan,
              defaultRows: nextPreset.defaultRows,
              name: value.name.trim() ? value.name : nextPreset.name,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select widget preset" />
          </SelectTrigger>
          <SelectContent>
            {dashboardWidgetPresets.map((item) => (
              <SelectItem key={item.key} value={item.key}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="grid gap-2 lg:col-span-2">
        <span className="text-sm font-medium">Description</span>
        <Textarea
          disabled={disabled}
          value={value.description}
          onChange={(event) =>
            onChange({ ...value, description: event.target.value })
          }
          placeholder="Short note for admins."
          rows={3}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">Default width</span>
        <Input
          disabled={disabled}
          type="number"
          min={1}
          max={6}
          value={value.defaultSpan}
          onChange={(event) =>
            onChange({ ...value, defaultSpan: Number(event.target.value || 6) })
          }
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">Default height</span>
        <Input
          disabled={disabled}
          type="number"
          min={1}
          max={12}
          value={value.defaultRows}
          onChange={(event) =>
            onChange({ ...value, defaultRows: Number(event.target.value || 3) })
          }
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">Status</span>
        <Select
          disabled={disabled}
          value={String(value.status)}
          onValueChange={(status) =>
            onChange({ ...value, status: status === "0" ? 0 : 1 })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="0">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
        <div className="text-sm font-medium">{preset?.name || "Preset"}</div>
        <div className="text-muted-foreground mt-2 text-sm leading-6">
          {preset?.description || "Select a preset to see what this widget will render."}
        </div>
      </div>
    </div>
  );
}

function blankDraft(): WidgetDraft {
  return {
    name: "",
    templateKey: "utility_overview",
    description: getDashboardWidgetPreset("utility_overview")?.description || "",
    defaultSpan: 6,
    defaultRows: 3,
    status: 1,
  };
}

function validateDraft(
  draft: WidgetDraft | DashboardWidgetEntity,
  rows: DashboardWidgetEntity[],
  currentId?: string,
) {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Widget name is required.");
  if (!getDashboardWidgetPreset(draft.templateKey)) {
    errors.push("Select a valid widget preset.");
  }
  if (
    rows.some(
      (item) =>
        item.id !== currentId &&
        item.name.trim().toLowerCase() === draft.name.trim().toLowerCase(),
    )
  ) {
    errors.push("Widget name must be unique.");
  }
  if (draft.defaultSpan < 1 || draft.defaultSpan > 6) {
    errors.push("Default width must be between 1 and 6.");
  }
  if (draft.defaultRows < 1 || draft.defaultRows > 12) {
    errors.push("Default height must be between 1 and 12.");
  }
  return errors;
}
