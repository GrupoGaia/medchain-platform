"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, LogOut, Menu } from "lucide-react";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userSubtitle?: string;
  logoutAction: () => void;
}

const navItems = [
  { href: "/medico/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/medico/solicitar", label: "Solicitar acesso", icon: PlusCircle },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-50 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, userName, userSubtitle, logoutAction }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-white shadow-sm lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo size="sm" />
        </div>
        <NavLinks pathname={pathname} />
        
        <div className="border-t border-border p-3">
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            >
              <LogOut size={18} />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header mobile */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm lg:hidden">
          <Logo size="sm" />
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="flex h-16 items-center border-b border-border px-5">
                <Logo size="sm" />
              </div>
              <NavLinks pathname={pathname} />
              <div className="border-t border-border p-3">
                <form action={logoutAction}>
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut size={18} />
                    Sair
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Header desktop */}
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-end border-b border-border bg-white px-8 shadow-sm lg:flex">
          <UserMenu name={userName} subtitle={userSubtitle} onLogout={logoutAction} />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
