import { SidebarTrigger } from "@/app/components/ui/sidebar";

import { CompanySwitcher } from "@/layouts/AppTopbar/CompanySwitcher";
import { NotificationsButton } from "@/layouts/AppTopbar/NotificationsButton";
import { ThemeSwitcher } from "@/layouts/AppTopbar/ThemeSwitcher";
import { TopbarSearch } from "@/layouts/AppTopbar/TopbarSearch";
import { UserMenu } from "@/layouts/AppTopbar/UserMenu";

export function AppTopbar() {
  return (
    <header className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-6">
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

