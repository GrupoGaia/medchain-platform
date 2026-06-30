import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserMenuProps {
  name: string;
  subtitle?: string;
  onLogout: () => void;
}

export function UserMenu({ name, subtitle, onLogout }: UserMenuProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-auto gap-3 px-2 py-1.5 hover:bg-muted">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium leading-tight text-foreground">{name}</p>
              {subtitle && (
                <p className="text-xs leading-tight text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary-50 text-xs font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 md:hidden">
          <p className="text-sm font-medium text-foreground">{name}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <DropdownMenuSeparator className="md:hidden" />
        <DropdownMenuItem onClick={onLogout} className="gap-2 text-destructive focus:text-destructive">
          <LogOut size={16} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
