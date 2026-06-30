import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 24, text: "text-base" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 40, text: "text-xl" },
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="m-1.5"
        >
          <path
            d="M16 4C12.134 4 9 7.13401 9 11V13H7C5.89543 13 5 13.8954 5 15V17C5 18.1046 5.89543 19 7 19H9V21C9 24.866 12.134 28 16 28C19.866 28 23 24.866 23 21V19H25C26.1046 19 27 18.1046 27 17V15C27 13.8954 26.1046 13 25 13H23V11C23 7.13401 19.866 4 16 4Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 17H16M16 17H19M16 17V14M16 17V20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="16"
            cy="11"
            r="1.5"
            fill="currentColor"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", text)}>
          MedChain
        </span>
      )}
    </div>
  );
}
