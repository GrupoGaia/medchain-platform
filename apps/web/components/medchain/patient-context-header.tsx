import { ShieldCheck, FileLock2 } from "lucide-react";
import { AccessCountdown } from "./access-countdown";
import { PatientIdentity } from "./patient-identity";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PatientContextHeaderProps {
  patientName: string;
  /** Identificadores do paciente já formatados. */
  identifiers?: string[];
  scopeLabel: string;
  /** Motivo declarado pelo profissional ao pedir o acesso. */
  reason?: string | null;
  expiresAtFormatted: string;
  minutesRemaining: number;
  totalMinutes: number;
  /** Ação de encerrar o acesso. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Faixa de contexto do prontuário. Responde, sem rolar a página, às quatro
 * perguntas que o profissional precisa ter respondidas o tempo todo: quem é o
 * paciente, por que existe acesso, a que ele dá direito e quanto tempo resta.
 *
 * Fica grudada no topo a partir de lg. No mobile ela rola junto, senão comeria
 * boa parte da altura útil da tela.
 */
export function PatientContextHeader({
  patientName,
  identifiers = [],
  scopeLabel,
  reason,
  expiresAtFormatted,
  minutesRemaining,
  totalMinutes,
  actions,
  className,
}: PatientContextHeaderProps) {
  return (
    <section
      aria-label="Contexto do acesso ao prontuário"
      className={cn(
        "rounded-xl border border-border bg-surface shadow-surface lg:sticky lg:top-[4.5rem] lg:z-10",
        className
      )}
    >
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <PatientIdentity
          name={patientName}
          size="lg"
          nameAs="h1"
          meta={identifiers.length > 0 ? identifiers.join(" · ") : undefined}
          className="min-w-0 lg:flex-1"
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <dl className="flex flex-wrap items-start gap-x-6 gap-y-3">
            <div>
              <dt className="text-overline uppercase text-muted-foreground">
                Escopo autorizado
              </dt>
              <dd className="mt-1">
                <Badge variant="brand">
                  <FileLock2 aria-hidden />
                  {scopeLabel}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-overline uppercase text-muted-foreground">
                Expira às
              </dt>
              <dd className="mt-1 text-label font-medium tabular-nums text-foreground">
                {expiresAtFormatted}
              </dd>
            </div>
            <div className="min-w-[9rem]">
              <dt className="text-overline uppercase text-muted-foreground">
                Tempo restante
              </dt>
              <dd className="mt-1">
                <AccessCountdown
                  minutesRemaining={minutesRemaining}
                  totalMinutes={totalMinutes}
                />
              </dd>
            </div>
          </dl>

          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border-subtle bg-surface-subtle px-4 py-2.5">
        <StatusBadge tone="active" label="Acesso Temporário Ativo" icon={ShieldCheck} />
        <p className="text-caption text-muted-foreground">
          Autorizado pelo paciente. Toda abertura deste prontuário fica
          registrada em auditoria.
        </p>
        {reason && (
          <p className="w-full text-caption text-foreground-secondary sm:w-auto">
            <span className="font-medium text-foreground">Motivo declarado:</span>{" "}
            {reason}
          </p>
        )}
      </div>
    </section>
  );
}
