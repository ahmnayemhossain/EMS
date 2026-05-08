import { Input } from "@/core/app/components/ui/input";
import { Separator } from "@/core/app/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/app/components/ui/tabs";
import { Textarea } from "@/core/app/components/ui/textarea";
import { CreateActionDialog } from "@/core/components/CreateActionDialog";
import { SelectFilter } from "@/core/components/SelectFilter";
import type { SDSRecord } from "@/core/types/ems";

import { SDS_SECTION_TABS } from "./constants";

type SdsEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected?: SDSRecord;
  editMeta: { chemicalName: string; supplier: string; language: string; revisionDate: string; notes: string };
  setEditMeta: (updater: (previous: SdsEditDialogProps["editMeta"]) => SdsEditDialogProps["editMeta"]) => void;
  editTab: string;
  setEditTab: (value: string) => void;
  editDraftBySectionId: Record<string, string>;
  setEditDraftBySectionId: (updater: (previous: Record<string, string>) => Record<string, string>) => void;
  sectionTitleById: Record<string, string>;
  onSave: () => Promise<boolean>;
};

export function SdsEditDialog(props: SdsEditDialogProps) {
  return <CreateActionDialog title="Edit SDS record" submitLabel="Save" open={props.open} onOpenChange={props.onOpenChange} hideTrigger contentClassName="sm:max-w-2xl max-h-[80vh] overflow-y-auto" onCreate={props.onSave}><div className="grid gap-3 sm:grid-cols-2"><div className="grid gap-1.5 sm:col-span-2"><div className="text-muted-foreground text-xs">Chemical name</div><Input value={props.editMeta.chemicalName} onChange={(event) => props.setEditMeta((prev) => ({ ...prev, chemicalName: event.target.value }))} placeholder="Chemical name" /></div><div className="grid gap-1.5"><div className="text-muted-foreground text-xs">Supplier</div><Input value={props.editMeta.supplier} onChange={(event) => props.setEditMeta((prev) => ({ ...prev, supplier: event.target.value }))} placeholder="Supplier" /></div><div className="grid gap-1.5"><div className="text-muted-foreground text-xs">Language</div><SelectFilter value={props.editMeta.language || undefined} onChange={(value) => props.setEditMeta((prev) => ({ ...prev, language: value }))} placeholder="Select language" items={[{ value: "English", label: "English" }, { value: "Bangla", label: "Bangla" }]} /></div><div className="grid gap-1.5"><div className="text-muted-foreground text-xs">Revision date</div><Input type="date" value={props.editMeta.revisionDate} onChange={(event) => props.setEditMeta((prev) => ({ ...prev, revisionDate: event.target.value }))} /></div><div className="grid gap-1.5 sm:col-span-2"><div className="text-muted-foreground text-xs">File</div><div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">Replace SDS PDF (placeholder)</div></div></div><Separator className="my-1" /><Tabs value={props.editTab} onValueChange={props.setEditTab} className="w-full"><TabsList className="bg-muted/30 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border p-1 sm:grid-cols-4">{SDS_SECTION_TABS.map((tab) => <TabsTrigger key={tab.id} value={tab.id} className="gap-2"><span className="text-xs font-semibold">{tab.label}</span></TabsTrigger>)}</TabsList>{SDS_SECTION_TABS.map((tab) => <TabsContent key={tab.id} value={tab.id} className="mt-3 m-0"><div className="grid gap-3">{tab.sectionIds.map((sectionId) => <div key={sectionId} className="grid gap-1.5"><div className="text-muted-foreground text-xs">Section {sectionId}: {props.sectionTitleById[sectionId] ?? `Section ${sectionId}`}</div><Textarea value={props.editDraftBySectionId[sectionId] ?? ""} onChange={(event) => props.setEditDraftBySectionId((prev) => ({ ...prev, [sectionId]: event.target.value }))} rows={4} placeholder="Type section details..." /></div>)}</div></TabsContent>)}</Tabs></CreateActionDialog>;
}
