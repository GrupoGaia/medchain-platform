export function Footer() {
  return (
    <footer className="border-t bg-white py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MedChain. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Plataforma de prontuário eletrônico com soberania do paciente.
          </p>
        </div>
      </div>
    </footer>
  );
}
