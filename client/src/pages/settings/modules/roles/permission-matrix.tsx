import { cn } from "@/app/components/ui/utils";
import { groupPermissions, permissionColumns, permissionColumnLabels } from "@/pages/settings/modules/roles/helpers";
import type { PermissionOption } from "@/pages/settings/modules/settingsEntityApi";

export function PermissionMatrix(props: { permissionKeys: string[]; permissions: PermissionOption[]; invalid?: boolean; onChange: (keys: string[]) => void }) {
  const groups = groupPermissions(props.permissions);
  return <div className={cn("max-h-[52vh] overflow-y-auto overflow-x-hidden rounded-md border bg-background shadow-xs", props.invalid && "border-destructive ring-[3px] ring-destructive/20")}><div className="w-full"><MatrixHeader groups={groups} selectedKeys={props.permissionKeys} onToggleColumn={(column, checked) => props.onChange(toggleColumn(groups, props.permissionKeys, column, checked))} />{groups.map((group) => <MatrixRow key={group.name} group={group} selectedKeys={props.permissionKeys} onToggle={(key, checked) => props.onChange(checked ? Array.from(new Set([...props.permissionKeys, key])) : props.permissionKeys.filter((item) => item !== key))} />)}</div></div>;
}

function MatrixHeader(props: any) {
  return <div className="sticky top-0 z-10 grid grid-cols-[minmax(120px,1fr)_repeat(4,minmax(42px,56px))] rounded-t-md border-b bg-background/95 text-[11px] font-medium text-muted-foreground shadow-[0_1px_0_0_var(--border)] backdrop-blur sm:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(72px,92px))] sm:text-xs"><div className="flex items-center px-3 py-2.5">Feature</div>{permissionColumns.map((column) => <HeaderToggle key={column} groups={props.groups} column={column} selectedKeys={props.selectedKeys} onToggle={props.onToggleColumn} />)}</div>;
}

function HeaderToggle(props: any) {
  const columnKeys = props.groups.map((group: any) => group.permissions[props.column]?.key).filter(Boolean);
  const checkedCount = columnKeys.filter((key: string) => props.selectedKeys.includes(key)).length;
  const allChecked = columnKeys.length > 0 && checkedCount === columnKeys.length;
  const someChecked = checkedCount > 0 && !allChecked;
  return <label className="flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 border-l px-1.5 py-2 text-center transition-colors hover:bg-muted/40 sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5" title={`Toggle all ${permissionColumnLabels[props.column]}`}><input type="checkbox" className="size-3.5 shrink-0 rounded border-border accent-primary" checked={allChecked} ref={(node) => { if (node) node.indeterminate = someChecked; }} onChange={(event) => props.onToggle(props.column, event.target.checked)} /><span className="hidden sm:inline">{permissionColumnLabels[props.column]}</span><span className="sm:hidden">{permissionColumnLabels[props.column].slice(0, 1)}</span></label>;
}

function MatrixRow(props: any) {
  return <div className="grid grid-cols-[minmax(120px,1fr)_repeat(4,minmax(42px,56px))] border-b transition-colors last:border-b-0 hover:bg-muted/35 sm:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(72px,92px))]"><div className="flex min-h-11 min-w-0 items-center px-3 text-sm font-medium"><span className="truncate">{props.group.name}</span></div>{permissionColumns.map((column) => <MatrixCell key={column} permission={props.group.permissions[column]} checked={props.group.permissions[column] ? props.selectedKeys.includes(props.group.permissions[column].key) : false} label={`${props.group.name} ${permissionColumnLabels[column]}`} onToggle={(checked) => props.onToggle(props.group.permissions[column].key, checked)} />)}</div>;
}

function MatrixCell(props: any) {
  return <div className="grid min-h-11 place-items-center border-l px-1.5 sm:px-3">{props.permission ? <input type="checkbox" className="size-4 rounded border-border accent-primary" checked={props.checked} aria-label={props.label} title={props.permission.key} onChange={(event) => props.onToggle(event.target.checked)} /> : <span className="text-xs text-muted-foreground/50">-</span>}</div>;
}

function toggleColumn(groups: any[], selectedKeys: string[], column: any, checked: boolean) {
  const columnKeys = groups.map((group) => group.permissions[column]?.key).filter(Boolean);
  return checked ? Array.from(new Set([...selectedKeys, ...columnKeys])) : selectedKeys.filter((key) => !columnKeys.includes(key));
}
