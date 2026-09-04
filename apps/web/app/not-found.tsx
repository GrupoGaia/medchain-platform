import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-white px-6">
      <Card className="w-full max-w-md border shadow-sm">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileQuestion size={22} />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Página não encontrada</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O endereço que você abriu não existe ou foi movido.
          </p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "mt-6 gap-1.5")}
          >
            <ArrowLeft size={16} />
            Voltar ao início
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
