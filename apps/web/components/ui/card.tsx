import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Cartão é superfície com borda, não com sombra. `elevation` só sai de `none`
// quando o elemento realmente flutua sobre o conteúdo; cartão em lista fica
// plano, senão a página vira um campo de caixas soltas.
const cardVariants = cva(
  "flex flex-col rounded-xl border bg-card text-body text-card-foreground",
  {
    variants: {
      elevation: {
        none: "border-border",
        surface: "border-border shadow-surface",
        floating: "border-border/70 shadow-floating",
      },
      tone: {
        default: "",
        subtle: "bg-surface-subtle",
        muted: "border-dashed bg-surface-subtle",
      },
    },
    defaultVariants: {
      elevation: "none",
      tone: "default",
    },
  }
)

function Card({
  className,
  elevation,
  tone,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ elevation, tone }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex items-start justify-between gap-3 px-5 pb-3 pt-4",
        className
      )}
      {...props}
    />
  )
}

function CardHeading({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-heading"
      className={cn("min-w-0 space-y-0.5", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-card-title text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-body-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 pb-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "mt-auto flex items-center gap-3 rounded-b-xl border-t border-border-subtle bg-surface-subtle px-5 py-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardHeading,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
