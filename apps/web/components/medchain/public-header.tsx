import Link from "next/link";
import { Logo } from "./logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicHeader({ showLogin = true }: { showLogin?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-header max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="rounded-md" aria-label="MedChain, página inicial">
          <Logo size="sm" />
        </Link>
        {showLogin && (
          <Link
            href="/medico/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Entrar como médico
          </Link>
        )}
      </div>
    </header>
  );
}
