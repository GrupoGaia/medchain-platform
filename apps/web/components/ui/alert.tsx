import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// O ícone entra por prop, e não como filho solto, para que o alinhamento em
// duas colunas seja garantido pelo componente. O tom nunca informa sozinho:
// todo alerta tem título em texto.
const alertVariants = cva(
  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-foreground",
        info: "border-info-border bg-info-subtle text-foreground",
        success: "border-success-border bg-success-subtle text-foreground",
        warning: "border-warning-border bg-warning-subtle text-foreground",
        danger: "border-danger-border bg-danger-subtle text-foreground",
        destructive: "border-danger-border bg-danger-subtle text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconVariants = cva("mt-0.5 shrink-0 [&>svg]:size-[18px]", {
  variants: {
    variant: {
      default: "text-muted-foreground",
      info: "text-info",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      destructive: "text-danger",
    },
  },
  defaultVariants: { variant: "default" },
})

function Alert({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & { icon?: React.ReactNode }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon ? (
        <span aria-hidden className={cn(iconVariants({ variant }))}>
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1 space-y-1">{children}</div>
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-title"
      className={cn("text-label font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-body-sm text-foreground-secondary [&_a]:underline [&_a]:underline-offset-2",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("flex items-center gap-2 pt-1", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
