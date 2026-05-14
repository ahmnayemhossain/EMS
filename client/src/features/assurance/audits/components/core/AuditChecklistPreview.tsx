import { Progress } from "@/components/ui/primitives/progress";
import { StatusBadge } from "@/components/feedback/StatusBadge";

export function AuditChecklistPreview({
  stats,
}: {
  stats: { total: number; progress: number; score: number; template: { name: string } };
}) {
  return (
    <>
      <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
        <div>
          <div className="text-sm font-medium">Checklist preview</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Total items {stats.total} • Default score {stats.score}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge tone="neutral">{stats.template.name}</StatusBadge>
        </div>
      </div>
      <div className="sm:col-span-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{stats.progress}%</span>
        </div>
        <Progress value={stats.progress} className="mt-2" />
      </div>
    </>
  );
}
