import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorized } from "@/lib/api-auth";

// GET /api/me/contact-links: os vinculos que o proprio usuario pediu, com o
// status de cada um.
//
// Existe porque o contato recem cadastrado ainda nao tem acesso a nada: toda
// rota de paciente devolve 403 ate o vinculo ser aprovado, e sem esta rota o
// app nao teria como dizer que o pedido esta aguardando resposta.
//
// A resposta nao traz nada do paciente, nem o nome. Quem pediu o vinculo sabe
// de quem se trata, e um pedido pendente nao pode virar meio de confirmar
// dados de alguem que ainda nao respondeu.
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const links = (user.contactFor ?? []).map((link) => ({
    id: link.id,
    status: link.status,
    relation: link.relation,
    createdAt: link.createdAt,
    respondedAt: link.respondedAt,
  }));

  return NextResponse.json(links);
}
