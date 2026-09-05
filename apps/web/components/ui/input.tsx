import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

// A borda usa `input`, que é o único cinza da escala com 3:1 contra a
// superfície branca. Sem isso o contorno do campo não é perceptível o
// bastante para satisfazer o SC 1.4.11.
//
// O anel de foco vem da regra global `:focus-visible`; aqui só reforçamos a
// borda para que o campo ativo seja legível também sem o outline.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-surface px-3 text-body text-foreground shadow-none transition-colors duration-fast",
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

export { Input }
