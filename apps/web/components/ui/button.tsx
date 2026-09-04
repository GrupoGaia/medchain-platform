import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// O anel de foco vem da regra global `:focus-visible` do globals.css, então
// nenhuma variante aqui remove o outline. Uma única definição garante que
// nenhum botão fique sem indicador de teclado.
//
// A variante primária pinta com `interactive` (brand-700) e não com `primary`
// (brand-600): é o tom mais claro da marca que dá 4,5:1 com texto branco.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent text-label font-medium whitespace-nowrap transition-colors duration-fast ease-standard select-none disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-interactive text-interactive-foreground hover:bg-interactive-hover active:bg-interactive-hover",
        outline:
          "border-border-strong bg-surface text-foreground hover:bg-surface-subtle hover:border-border-strong aria-expanded:bg-surface-subtle",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-border aria-expanded:bg-border",
        ghost:
          "text-foreground-secondary hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground",
        destructive:
          "bg-danger-solid text-white hover:bg-danger active:bg-danger",
        "destructive-outline":
          "border-danger-border bg-surface text-danger hover:bg-danger-subtle",
        link: "text-interactive underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-caption [&_svg]:size-3.5",
        sm: "h-8 px-2.5 [&_svg]:size-4",
        default: "h-9 px-3 [&_svg]:size-4",
        lg: "h-10 px-4 text-body [&_svg]:size-[18px]",
        icon: "size-9 px-0 [&_svg]:size-4",
        "icon-xs": "size-7 px-0 [&_svg]:size-3.5",
        "icon-sm": "size-8 px-0 [&_svg]:size-4",
        "icon-lg": "size-10 px-0 [&_svg]:size-[18px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
