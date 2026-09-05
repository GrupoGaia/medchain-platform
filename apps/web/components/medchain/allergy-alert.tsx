import { AlertTriangle } from "lucide-react";

/**
 * Alerta de alergia. É o único dado do prontuário que ganha destaque próprio,
 * porque prescrever sem ver essa lista é o erro de maior consequência que a
 * tela pode induzir.
 *
 * `role="alert"` não seria adequado aqui: o conteúdo já existe quando a página
 * carrega, e o leitor de tela o encontra pelo título da região.
 */
export function AllergyAlert({ allergies }: { allergies: readonly string[] }) {
  if (allergies.length === 0) return null;

  return (
    <section
      aria-labelledby="alerta-alergias"
      className="rounded-xl border border-danger-border bg-danger-subtle p-4"
    >
      <h3
        id="alerta-alergias"
        className="flex items-center gap-2 text-label font-semibold text-danger"
      >
        <AlertTriangle size={16} aria-hidden />
        Alergias registradas
      </h3>
      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {allergies.map((allergy) => (
          <li
            key={allergy}
            className="rounded-md border border-danger-border bg-surface px-2 py-1 text-label font-medium text-danger"
          >
            {allergy}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-caption text-foreground-secondary">
        Confirme com o paciente antes de prescrever.
      </p>
    </section>
  );
}
