import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { isValidCpf, normalizeCpf } from "@medchain/domain";

// GET /api/patients/search?cpf=: localiza um paciente pelo CPF exato.
//
// A correspondencia parcial fica de fora de proposito. Busca por prefixo ou por
// trecho do nome devolve a base inteira aos poucos, que e exatamente o que esta
// rota existe para impedir. O medico precisa ja saber de quem esta falando.
//
// O nome completo volta na resposta porque, sem ele, o medico nao consegue
// conferir se acertou a pessoa antes de disparar a solicitacao. Quem digitou o
// CPF exato ja demonstrou contato com o paciente.
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.professionalProfile) return forbidden();

  const cpf = request.nextUrl.searchParams.get("cpf") ?? "";

  // Valida antes de consultar: CPF malformado nunca chega ao banco, e a
  // resposta nao distingue "invalido" de "nao existe" por engano.
  if (!isValidCpf(cpf)) {
    return NextResponse.json({ error: "CPF inválido." }, { status: 422 });
  }

  const patient = await prisma.patientProfile.findUnique({
    where: { cpf: normalizeCpf(cpf) },
    select: { id: true, fullName: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Nenhum paciente com este CPF." }, { status: 404 });
  }

  return NextResponse.json(patient);
}
