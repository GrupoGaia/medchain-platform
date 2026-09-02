import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function BlockedDocumentsCard({ withheld }: { withheld: readonly string[] }) {
  if (withheld.length === 0) return null;

  return (
    <Card className="border-dashed bg-muted/40 shadow-none">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <Lock size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Conteúdo fora do escopo autorizado
          </p>
          <p className="text-sm text-muted-foreground">
            O paciente não autorizou o acesso a: {withheld.join(", ").toLowerCase()}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
