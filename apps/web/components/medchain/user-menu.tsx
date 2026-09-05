"use client";

import { LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initialsFrom } from "@/lib/initials";

interface UserMenuProps {
  name: string;
  subtitle?: string;
  institution?: string;
  onLogout: () => void;
}

export function UserMenu({
  name,
  subtitle,
  institution,
  onLogout,
}: UserMenuProps) {
  const initials = initialsFrom(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 pl-1.5 pr-2"
            aria-label={`Conta de ${name}`}
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[10rem] truncate text-label font-medium text-foreground md:inline">
          {name}
        </span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5">
          <p className="truncate text-label font-semibold text-foreground">
            {name}
          </p>
          {subtitle && (
            <p className="truncate text-caption text-muted-foreground">
              {subtitle}
            </p>
          )}
          {institution && (
            <p className="mt-0.5 truncate text-caption text-muted-foreground">
              {institution}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} variant="destructive" className="gap-2">
          <LogOut size={16} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
