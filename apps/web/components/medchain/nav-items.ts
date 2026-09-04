import { LayoutDashboard, PlusCircle, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Rotas que também acendem este item, além do próprio href. */
  matches?: string[];
}

export interface NavGroup {
  /** Título do grupo. Ausente no primeiro grupo, que não precisa de rótulo. */
  label?: string;
  items: NavItem[];
}

// A navegação vive aqui, e não dentro da barra lateral, porque o cabeçalho usa
// a mesma lista para montar a trilha. Uma rota nova entra em um lugar só.
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        href: "/medico/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/medico/solicitar",
        label: "Solicitar acesso",
        icon: PlusCircle,
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const hrefs = [item.href, ...(item.matches ?? [])];
  return hrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );
}
