import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  description?: string;
  variant?: "default" | "primary" | "amber";
}

const variants = {
  default: "bg-white text-foreground",
  primary: "bg-primary-50 text-primary border-primary-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
};

const iconVariants = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary-100 text-primary",
  amber: "bg-amber-100 text-amber-600",
};

export function StatCard({ title, value, icon: Icon, description, variant = "default" }: StatCardProps) {
  return (
    <Card className={cn("border shadow-sm", variants[variant])}>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className={cn("text-sm font-medium", variant === "default" ? "text-muted-foreground" : "text-current/80")}>
            {title}
          </p>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {description && <p className="text-xs opacity-80">{description}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconVariants[variant])}>
            <Icon size={20} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
