"use client";

import * as React from "react";

import { SIDEBAR_COOKIE_MAX_AGE, SIDEBAR_COOKIE_NAME, SIDEBAR_KEYBOARD_SHORTCUT } from "./sidebar.constants";

export function useSidebarToggle({
  isMobile,
  open,
  setOpenProp,
  defaultOpen,
}: {
  isMobile: boolean;
  open?: boolean;
  setOpenProp?: (open: boolean) => void;
  defaultOpen: boolean;
}) {
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const resolvedOpen = open ?? _open;

  const setOpen = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(resolvedOpen) : value;
    if (setOpenProp) setOpenProp(openState);
    else _setOpen(openState);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [setOpenProp, resolvedOpen]);

  const toggleSidebar = React.useCallback(() => (
    isMobile ? setOpenMobile((value) => !value) : setOpen((value) => !value)
  ), [isMobile, setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== SIDEBAR_KEYBOARD_SHORTCUT || (!event.metaKey && !event.ctrlKey)) return;
      event.preventDefault();
      toggleSidebar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return { open: resolvedOpen, setOpen, openMobile, setOpenMobile, toggleSidebar };
}
