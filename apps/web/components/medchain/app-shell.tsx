"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { Breadcrumbs, buildCrumbs } from "./breadcrumbs";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userSubtitle?: string;
  institution?: string;
  logoutAction: () => void;
}

export function AppShell({
  children,
  userName,
  userSubtitle,
  institution,
  logoutAction,
}: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const crumbs = buildCrumbs(pathname);
  const user = { name: userName, role: userSubtitle, institution };

  // O painel lateral do mobile precisa fechar quando a rota muda. Sem isto ele
  // fica aberto por cima da página nova depois de tocar num item do menu.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-label focus:font-medium focus:text-foreground focus:shadow-floating"
      >
        Pular para o conteúdo
      </a>

      {/* Barra lateral fixa: só a partir de lg, onde há largura sobrando. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar border-r border-sidebar-border lg:block">
        <AppSidebar pathname={pathname} user={user} logoutAction={logoutAction} />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-sidebar">
        <header className="sticky top-0 z-20 flex h-header shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Abrir menu de navegação"
                />
              }
            >
              <Menu size={18} />
            </SheetTrigger>
            <SheetContent side="left" className="p-0" showCloseButton={false}>
              <SheetTitle className="sr-only">Navegação principal</SheetTitle>
              <AppSidebar
                pathname={pathname}
                user={user}
                logoutAction={logoutAction}
                onNavigate={() => setMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <span className="lg:hidden">
            <Logo size="sm" showText={false} />
          </span>

          <Breadcrumbs items={crumbs} className="hidden flex-1 sm:block" />
          <span className="flex-1 sm:hidden" />

          <UserMenu
            name={userName}
            subtitle={userSubtitle}
            institution={institution}
            onLogout={logoutAction}
          />
        </header>

        <main id="conteudo" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
