import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full rounded-lg border border-input bg-surface px-3 py-2 text-body text-foreground transition-colors duration-fast",
        "placeholder:text-muted-foreground",
        "focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-disabled disabled:text-foreground-disabled",
        "aria-invalid:border-danger aria-invalid:focus-visible:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
