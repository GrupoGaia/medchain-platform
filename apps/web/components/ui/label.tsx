"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1.5 text-label font-medium text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

// Texto de apoio do campo. Fica entre o rótulo e o controle, e é referenciado
// por aria-describedby na tela que o usa, para que o leitor de tela leia a
// explicação junto com o campo.
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-caption text-muted-foreground", className)}
      {...props}
    />
  )
}

// Mensagem de erro do campo. `role="alert"` garante que o leitor de tela
// anuncie a falha assim que ela aparece.
function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-caption font-medium text-danger", className)}
      {...props}
    />
  )
}

export { Label, FieldDescription, FieldError }
