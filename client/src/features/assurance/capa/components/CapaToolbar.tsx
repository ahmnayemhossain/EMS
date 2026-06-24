import { Archive, KanbanSquare, List, RefreshCw } from "lucide-react";

import { SearchInput } from "@/components/forms/SearchInput";
import { PageHeader } from "@/components/layout/primitives/PageHeader";
import { Button } from "@/components/ui/primitives/button";

type CapaToolbarProps = {
  loading: boolean;
  search: string;
  mode: "active" | "dismissed";
  view: "kanban" | "list";
  onSearchChange: (value: string) => void;
  onModeToggle: () => void;
  onViewToggle: () => void;
  onRefresh: () => void | Promise<void>;
};

export function CapaToolbar(props: CapaToolbarProps) {
  return (
    <>
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden w-[280px] lg:block">
              <SearchInput value={props.search} onChange={props.onSearchChange} placeholder="Search CAPA..." />
            </div>
            <Button
              variant={props.mode === "dismissed" ? "default" : "outline"}
              size="sm"
              onClick={props.onModeToggle}
              className="gap-2"
            >
              <Archive className="size-4" />
              Dismissed
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={props.onViewToggle}
              aria-label={props.view === "kanban" ? "Switch to list view" : "Switch to kanban view"}
              title={props.view === "kanban" ? "List view" : "Kanban view"}
            >
              {props.view === "kanban" ? <List className="size-4" /> : <KanbanSquare className="size-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => void props.onRefresh()} disabled={props.loading} aria-label="Refresh CAPA">
              <RefreshCw className={["size-4", props.loading ? "animate-spin" : ""].join(" ")} />
            </Button>
          </div>
        }
      />
      <div className="lg:hidden">
        <SearchInput value={props.search} onChange={props.onSearchChange} placeholder="Search CAPA..." />
      </div>
    </>
  );
}
