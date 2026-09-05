import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-border bg-surface px-6 py-10 text-center">
        <span
          aria-hidden
          className="mb-3 flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"
        >
          <FileQuestion size={19} />
        </span>
        <h1 className="text-section-title text-foreground">Página não encontrada</h1>
        <p className="mt-1 max-w-sm text-body-sm text-foreground-secondary">
          O endereço que você abriu não existe ou foi movido.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
        >
          <ArrowLeft aria-hidden />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
