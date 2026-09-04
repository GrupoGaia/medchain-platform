CREATE TYPE "ContactLinkStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- A coluna entra com default APPROVED so para preencher as linhas que ja
-- existem. Elas representam vinculos que o paciente ja tinha, criados pelo
-- seed, e derruba-los para PENDING tiraria acesso de quem sempre teve.
ALTER TABLE "emergency_contacts"
  ADD COLUMN "status" "ContactLinkStatus" NOT NULL DEFAULT 'APPROVED';

-- Com as linhas antigas preenchidas, o default passa a ser PENDING, que e o
-- que vale para todo vinculo criado a partir daqui.
ALTER TABLE "emergency_contacts"
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "emergency_contacts"
  ADD COLUMN "responded_at" TIMESTAMP(3);

-- As linhas retroativas contam como respondidas na data em que foram criadas,
-- senao a tela do paciente mostraria vinculo aprovado sem data nenhuma.
UPDATE "emergency_contacts" SET "responded_at" = "created_at" WHERE "responded_at" IS NULL;

CREATE INDEX "idx_emergency_contacts_patient_status"
  ON "emergency_contacts"("patient_id", "status");

-- A RLS e a segunda camada de autorizacao. Sem este filtro ela continuaria
-- tratando vinculo pendente como valido, mesmo com a API ja recusando.
CREATE OR REPLACE FUNCTION is_emergency_contact_for_patient(target_patient_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "emergency_contacts"
    WHERE "patient_id" = target_patient_id
      AND "user_id" = current_db_user_id()
      AND "status" = 'APPROVED'
  )
$$;
