import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { box: "size-7 rounded-lg", glyph: 16, text: "text-label" },
  md: { box: "size-8 rounded-lg", glyph: 18, text: "text-section-title" },
  lg: { box: "size-10 rounded-xl", glyph: 22, text: "text-page-title" },
};

/**
 * Marca do produto. O símbolo é um escudo com cruz: o prontuário sob proteção,
 * que é a promessa do MedChain. É o único lugar do portal em que a marca ocupa
 * área preenchida.
 */
export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const { box, glyph, text } = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-interactive text-white",
          box
        )}
      >
        <svg
          width={glyph}
          height={glyph}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 2.75 19.25 5.6v5.15c0 4.62-3.06 7.7-7.25 8.94-4.19-1.24-7.25-4.32-7.25-8.94V5.6L12 2.75Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 8.6v6.1M8.95 11.65h6.1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", text)}>
          MedChain
        </span>
      )}
    </span>
  );
}
