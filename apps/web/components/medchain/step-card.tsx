interface StepCardProps {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}

export function StepCard({ step, title, description, isLast }: StepCardProps) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[15px] top-9 h-[calc(100%-2rem)] w-px bg-border"
        />
      )}
      <span
        aria-hidden
        className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-interactive-border bg-interactive-subtle text-label font-semibold tabular-nums text-primary-800"
      >
        {step}
      </span>
      <div className="pt-1">
        <h3 className="text-card-title text-foreground">{title}</h3>
        <p className="mt-1 text-body-sm leading-relaxed text-foreground-secondary">
          {description}
        </p>
      </div>
    </li>
  );
}
