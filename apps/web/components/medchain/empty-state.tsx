import { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-white shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {Icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon size={24} className="text-muted-foreground" />
          </div>
        )}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
        {action && (
          <a href={action.href} className={cn(buttonVariants(), "mt-5")}>
            {action.label}
          </a>
        )}
      </CardContent>
    </Card>
  );
}
