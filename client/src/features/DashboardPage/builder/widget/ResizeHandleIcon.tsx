import { cn } from "@/core/app/components/ui/utils";

export function ResizeHandleIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 16 16" className={cn("h-4 w-4", className)} aria-hidden="true"><path d="M6 12.5L12.5 6M9 13.5L13.5 9M3.5 11L11 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg>;
}
