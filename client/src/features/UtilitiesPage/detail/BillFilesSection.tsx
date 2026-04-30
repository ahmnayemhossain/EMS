import { DetailCard } from "@/features/UtilitiesPage/detail/DetailCard";
import type { UtilityRecord } from "@/core/types/ems";
import { formatDate } from "@/core/utils/format";

export function BillFilesSection({ record }: { record: UtilityRecord }) {
  return (
    <DetailCard>
      <div className="text-muted-foreground text-xs">Bill uploads</div>
      <div className="mt-2 space-y-2 text-sm">
        {record.billFiles?.length ? record.billFiles.map((file) => <div key={file.name} className="flex items-center justify-between gap-3"><div className="min-w-0 truncate">{file.url ? <a href={file.url} target="_blank" rel="noreferrer" className="hover:underline">{file.name}</a> : file.name}</div><div className="text-muted-foreground shrink-0 text-xs">{formatDate(file.uploadedAt)}</div></div>) : <div className="text-muted-foreground text-sm">No files attached.</div>}
      </div>
    </DetailCard>
  );
}
