import { SidebarInset } from '@/components/ui/primitives/sidebar';

import { Header } from '@/core/header/Header';
import { PageContainer } from '@/core/main-canvas/PageContainer';

export function MainCanvas() {
  return (
    <SidebarInset className="h-svh min-h-svh overflow-hidden bg-background pt-1 pb-1 [--sidebar-current-width:var(--sidebar-width)] peer-data-[state=collapsed]:[--sidebar-current-width:var(--sidebar-width-icon)]">
      <div
        data-slot="app-canvas-scroll"
        className="flex min-h-0 flex-1 flex-col overflow-auto pb-3"
      >
        <Header />
        <PageContainer />
      </div>
    </SidebarInset>
  );
}
