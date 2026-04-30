"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "./utils";
import { MenubarPortal } from "./menubar.shared";

export function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return <MenubarPrimitive.Trigger data-slot="menubar-trigger" className={cn("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none", className)} {...props} />;
}

export function MenubarContent({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return <MenubarPortal><MenubarPrimitive.Content data-slot="menubar-content" align={align} alignOffset={alignOffset} sideOffset={sideOffset} className={cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md", className)} {...props} /></MenubarPortal>;
}

export function MenubarLabel({ className, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }) {
  return <MenubarPrimitive.Label data-slot="menubar-label" data-inset={inset} className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)} {...props} />;
}

export function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator data-slot="menubar-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />;
}

export function MenubarShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="menubar-shortcut" className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />;
}

export function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }) {
  return <MenubarPrimitive.SubTrigger data-slot="menubar-sub-trigger" data-inset={inset} className={cn("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8", className)} {...props}>{children}<ChevronRightIcon className="ml-auto h-4 w-4" /></MenubarPrimitive.SubTrigger>;
}

export function MenubarSubContent({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return <MenubarPrimitive.SubContent data-slot="menubar-sub-content" className={cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)} {...props} />;
}
