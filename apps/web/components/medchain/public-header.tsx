import { Logo } from "./logo";

export function PublicHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        <Logo size="sm" />
      </div>
    </header>
  );
}
