-- CPF do paciente, usado pelo medico para localizar quem ele quer solicitar
-- acesso. Nulo e permitido: quem se cadastrou antes desta coluna continua sem
-- CPF, e so deixa de aparecer na busca.
ALTER TABLE "patient_profiles" ADD COLUMN "cpf" TEXT;

-- Unico para impedir dois perfis com o mesmo CPF. No Postgres, indice unico
-- aceita varios nulos, entao os perfis sem CPF nao conflitam entre si.
CREATE UNIQUE INDEX "patient_profiles_cpf_key" ON "patient_profiles"("cpf");
