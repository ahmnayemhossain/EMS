import { Outlet } from 'react-router';

import { Breadcrumbs } from '@/core/main-canvas/Breadcrumbs';
import { appConfig } from '@/core/platform/app-config';

export function PageContainer() {
  return (
    <div
      className="mx-auto w-full px-4 pt-3 pb-4 md:px-6"
      style={{ maxWidth: `${appConfig.shell.maxContentWidth}px` }}
    >
      <div className="mb-1 flex min-w-0 items-center">
        <Breadcrumbs />
      </div>
      <Outlet />
      <div aria-hidden className="h-6" />
    </div>
  );
}
