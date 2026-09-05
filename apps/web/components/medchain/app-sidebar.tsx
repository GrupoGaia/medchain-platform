"use client";

import Link from "next/link";
import { LogOut, Building2 } from "lucide-react";
import { Logo } from "./logo";
import { NAV_GROUPS, isNavItemActive } from "./nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SidebarUserContext {
  name: string;
  role?: string;
  institution?: string;
}

interface AppSidebarProps {
  pathname: string;
  user: SidebarUserContext;
  logoutAction: () => void;
  /** Fecha o painel lateral no mobile depois de navegar. */
  onNavigate?: () => void;
  className?: string;
}

/**
 * Navegação principal do portal. É a mesma no desktop, onde fica fixa, e no
 * mobile, onde é servida dentro de um painel lateral: uma só definição evita
 * que as duas versões divirjam.
 */
export function AppSidebar({
  pathname,
  user,
  logoutAction,
  onNavigate,
  className,
}: AppSidebarProps) {
  return (
    <div className={cn("flex h-full flex-col bg-sidebar", className)}>
      <div className="flex h-header shrink-0 items-center border-b border-sidebar-border px-4">
        <Link
          href="/medico/dashboard"
          onClick={onNavigate}
          className="rounded-md"
          aria-label="MedChain, ir para o dashboard"
        >
          <Logo size="sm" />
        </Link>
      </div>

      <nav
        aria-label="Navegação principal"
        className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4"
      >
        {NAV_GROUPS.map((group, index) => (
          <div key={group.label ?? index} className={cn(index > 0 && "mt-6")}>
            {group.label && (
              <p className="px-2.5 pb-2 text-overline uppercase text-muted-foreground">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-label transition-colors duration-fast ease-standard",
                        active
                          ? "bg-accent font-semibold text-accent-foreground"
                          : "font-medium text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      {/* Marcador à esquerda: o estado ativo não depende só da
                          diferença de cor de fundo. */}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-y-1.5 left-0 w-0.5 rounded-full",
                          active ? "bg-primary-600" : "bg-transparent"
                        )}
                      />
                      <Icon
                        size={17}
                        className={cn(
                          "shrink-0",
                          active ? "text-primary-700" : "text-muted-foreground"
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="mb-2 rounded-lg bg-surface-subtle px-2.5 py-2">
          <p className="truncate text-label font-semibold text-foreground">
            {user.name}
          </p>
          {user.role && (
            <p className="truncate text-caption text-muted-foreground">
              {user.role}
            </p>
          )}
          {user.institution && (
            <p className="mt-1.5 flex items-center gap-1.5 truncate text-caption text-foreground-secondary">
              <Building2 size={13} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{user.institution}</span>
            </p>
          )}
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5"
          >
            <LogOut size={16} />
            Sair
          </Button>
        </form>
      </div>
    </div>
  );
}
