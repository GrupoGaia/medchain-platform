import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <span
        aria-hidden
        className="mb-3 flex size-9 items-center justify-center rounded-md bg-interactive-subtle text-primary-700"
      >
        <Icon size={18} />
      </span>
      <h3 className="text-card-title text-foreground">{title}</h3>
      <p className="mt-1 text-body-sm leading-relaxed text-foreground-secondary">
        {description}
      </p>
    </div>
  );
}
