import { SidebarTrigger } from "@/core/app/components/ui/sidebar";

import { CompanySwitcher } from "@/core/layouts/AppTopbar/CompanySwitcher";
import { NotificationsButton } from "@/core/layouts/AppTopbar/NotificationsButton";
import { ThemeSwitcher } from "@/core/layouts/AppTopbar/ThemeSwitcher";
import { TopbarSearch } from "@/core/layouts/AppTopbar/TopbarSearch";
import { UserMenu } from "@/core/layouts/AppTopbar/UserMenu";
import { appConfig } from "@/core/platform/app-config";

export function AppTopbar() {
  return (
    <header className="bg-background/92 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b border-border/70 backdrop-blur">
      <div
        className="mx-auto flex h-11 items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-6"
        style={{ maxWidth: `${appConfig.shell.maxContentWidth}px` }}
      >
        <SidebarTrigger className="mr-1" />
        <div className="flex flex-1 items-center gap-2 sm:gap-3">
          <TopbarSearch />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <CompanySwitcher />
          <ThemeSwitcher />
          <NotificationsButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
