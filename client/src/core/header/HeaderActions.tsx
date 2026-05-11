import { CompanySwitcher } from '@/core/header/CompanySwitcher';
import { HeaderProfile } from '@/core/header/HeaderProfile';
import { NotificationsButton } from '@/core/header/NotificationsButton';
import { ThemeSwitcher } from '@/core/header/ThemeSwitcher';

export function HeaderActions() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <CompanySwitcher />
      <ThemeSwitcher />
      <NotificationsButton />
      <HeaderProfile />
    </div>
  );
}
