import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/core/app/components/ui/command";

export function GlobalSearchDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  items: Array<{ key: string; label: string; group: string; to: string }>;
  run: (to: string) => void;
}) {
  const grouped = groupItems(props.items);
  return (
    <CommandDialog open={props.open} onOpenChange={props.setOpen} title="Search" description="Search pages and settings">
      <CommandInput placeholder="Search pages, settings, and tools..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {grouped.map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => (
              <CommandItem key={item.key} value={`${group} ${item.label}`} onSelect={() => props.run(item.to)}>
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

function groupItems(items: Array<{ key: string; label: string; group: string; to: string }>) {
  const map = new Map<string, Array<{ key: string; label: string; group: string; to: string }>>();
  for (const item of items) {
    const list = map.get(item.group) ?? [];
    list.push(item);
    map.set(item.group, list);
  }
  return Array.from(map.entries());
}
