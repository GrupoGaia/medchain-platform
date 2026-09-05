import { cn } from "@/lib/utils"

// `aria-hidden` porque o esqueleto não é conteúdo: quem usa leitor de tela
// recebe o aviso pelo `aria-busy` da região que está carregando.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-md bg-border-subtle", className)}
      {...props}
    />
  )
}

export { Skeleton }
