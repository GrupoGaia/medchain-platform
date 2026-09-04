import { Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Aviso do que o escopo autorizado não libera. Aparece só quando existe
 * documento real retido: dizer "há conteúdo oculto" sem que exista nenhum
 * daria ao profissional uma informação falsa sobre o prontuário.
 */
export function WithheldScopeNotice({ withheld }: { withheld: readonly string[] }) {
  if (withheld.length === 0) return null;

  return (
    <Alert icon={<Lock />}>
      <AlertTitle>Há conteúdo fora do escopo autorizado</AlertTitle>
      <AlertDescription>
        O paciente não autorizou o acesso a: {withheld.join(", ").toLowerCase()}.
        Para consultar esses documentos é preciso solicitar um novo acesso com
        escopo compatível.
      </AlertDescription>
    </Alert>
  );
}
