import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo size="sm" />
        <div className="text-body-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} MedChain. Prontuário eletrônico com
            soberania do paciente.
          </p>
        </div>
      </div>
    </footer>
  );
}
