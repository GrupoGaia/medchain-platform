"use client";

import { useState } from "react";
import { Check, EyeOff } from "lucide-react";
import {
  ACCESS_SCOPES,
  SCOPE_LABEL,
  SCOPE_SHARES,
  SCOPE_WITHHOLDS,
  type AccessScope,
} from "@medchain/domain";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label, FieldDescription } from "@/components/ui/label";

/**
 * Escolha do escopo com a consequência à vista.
 *
 * As listas vêm de `SCOPE_SHARES` e `SCOPE_WITHHOLDS`, exatamente as mesmas
 * que o paciente lê na tela de autorização do aplicativo. As duas pontas
 * precisam enxergar o mesmo pedido, senão a autorização deixa de ser informada.
 */
// O gatilho do Select só sabe o rótulo do valor escolhido se a lista for
// declarada aqui: os itens do popup só existem no DOM depois da primeira
// abertura, e sem `items` o campo mostraria o valor cru ("FULL") no lugar de
// "Prontuário completo".
const SCOPE_ITEMS: Record<string, string> = Object.fromEntries(
  ACCESS_SCOPES.map((scope) => [scope, SCOPE_LABEL[scope]])
);

export function ScopeField() {
  const [scope, setScope] = useState<AccessScope | null>(null);

  return (
    <div className="space-y-1.5">
      <Label htmlFor="scope">
        Dados solicitados
        <span aria-hidden className="text-danger">
          *
        </span>
      </Label>
      <Select
        name="scope"
        required
        items={SCOPE_ITEMS}
        value={scope}
        onValueChange={(value) => setScope(value as AccessScope)}
      >
        <SelectTrigger id="scope" aria-describedby="scope-ajuda">
          <SelectValue placeholder="Selecione o escopo do acesso" />
        </SelectTrigger>
        <SelectContent>
          {ACCESS_SCOPES.map((value) => (
            <SelectItem key={value} value={value}>
              {SCOPE_LABEL[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription id="scope-ajuda">
        O escopo define exatamente o que o prontuário vai exibir enquanto o
        acesso estiver válido.
      </FieldDescription>

      {scope && (
        <div className="mt-3 rounded-lg border border-border bg-surface-subtle p-3">
          <p className="text-overline uppercase text-muted-foreground">
            O paciente verá este resumo ao decidir
          </p>

          <ul className="mt-2 space-y-1.5">
            {SCOPE_SHARES[scope].map((item) => (
              <li key={item} className="flex items-start gap-2 text-body-sm text-foreground">
                <Check size={14} aria-hidden className="mt-0.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>

          {SCOPE_WITHHOLDS[scope].length > 0 && (
            <ul className="mt-2 space-y-1.5 border-t border-border pt-2">
              {SCOPE_WITHHOLDS[scope].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-body-sm text-muted-foreground"
                >
                  <EyeOff size={14} aria-hidden className="mt-0.5 shrink-0" />
                  Permanece privado: {item.toLowerCase()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
