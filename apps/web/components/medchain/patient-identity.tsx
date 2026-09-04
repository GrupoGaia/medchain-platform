import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initialsFrom } from "./user-menu";
import { cn } from "@/lib/utils";

interface PatientIdentityProps {
  name: string;
  /** Linha de apoio: escopo, documento, data de nascimento. */
  meta?: React.ReactNode;
  size?: "sm" | "default" | "lg";
  /**
   * Elemento do nome. No prontuário o nome do paciente é o título da página,
   * então ele entra como `h1`; em lista continua sendo texto comum.
   */
  nameAs?: "h1" | "h2" | "p";
  className?: string;
}

const NAME_SIZE = {
  sm: "text-label font-semibold",
  default: "text-card-title",
  lg: "text-section-title",
} as const;

const AVATAR_SIZE = {
  sm: "sm",
  default: "default",
  lg: "lg",
} as const;

/**
 * Identificação do paciente. Iniciais em vez de foto: o portal não tem
 * fotografia real de paciente, e uma ilustração genérica repetida em todos os
 * registros passa a impressão errada de que é a pessoa daquele prontuário.
 */
export function PatientIdentity({
  name,
  meta,
  size = "default",
  nameAs: NameTag = "p",
  className,
}: PatientIdentityProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <Avatar size={AVATAR_SIZE[size]}>
        <AvatarFallback>{initialsFrom(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <NameTag className={cn("truncate text-foreground", NAME_SIZE[size])}>
          {name}
        </NameTag>
        {meta && (
          // Em lista a linha de apoio trunca para manter a altura da linha; no
          // cabeçalho do prontuário ela quebra, porque ali cada identificador
          // importa e cortar o sexo ou a data de nascimento seria perder dado.
          <div
            className={cn(
              "text-body-sm text-muted-foreground",
              size === "lg" ? "text-pretty" : "truncate"
            )}
          >
            {meta}
          </div>
        )}
      </div>
    </div>
  );
}
