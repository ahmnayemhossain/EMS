import { SidebarTrigger } from '@/components/ui/primitives/sidebar';

import { HeaderActions } from '@/core/header/HeaderActions';
import { TopbarSearch } from '@/core/header/TopbarSearch';
import { appConfig } from '@/core/platform/app-config';

export function Header() {
  return (
    <header className="bg-background/92 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b border-border/70 backdrop-blur">
      <div
        className="mx-auto flex min-h-12 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 md:px-6"
        style={{ maxWidth: `${appConfig.shell.maxContentWidth}px` }}
      >
        <SidebarTrigger className="mr-1" />
        <div className="flex flex-1 items-center gap-2 sm:gap-3">
          <TopbarSearch />
        </div>
        <HeaderActions />
      </div>
    </header>
  );
}
