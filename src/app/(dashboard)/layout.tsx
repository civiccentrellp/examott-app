'use client';

import { usePathname } from "next/navigation";
import { AsideNavigation } from "../../components/AsideNavigation";
import { Header } from "../../components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // Define all fullscreen routes in one place
  const fullscreenRoutes = ['/tests/', '/courses/', '/exam/', '/dbms/'];
  const isFullscreenPage = fullscreenRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col w-full relative z-50 bg-violet-50 overflow-hidden">
        <div className="w-full">
          {!isFullscreenPage && <Header />}
        </div>
        <div className="w-full flex h-full min-h-0">
          {!isFullscreenPage && <AsideNavigation />}
          <main
            className={`flex-1 w-full min-h-0 ${
              isFullscreenPage ? '' : 'px-2 py-4'
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
