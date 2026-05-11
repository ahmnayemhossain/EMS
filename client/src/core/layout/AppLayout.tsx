import * as React from 'react';

import { SidebarProvider } from '@/components/ui/primitives/sidebar';
import { MainCanvas } from '@/core/main-canvas/MainCanvas';
import { appConfig } from '@/core/platform/app-config';
import { Sidebar } from '@/core/sidebar/Sidebar';

export function AppLayout() {
  return (
    <SidebarProvider defaultOpen={appConfig.shell.defaultSidebarOpen}>
      <Sidebar />
      <MainCanvas />
    </SidebarProvider>
  );
}

