CREATE TYPE "AccessScope" AS ENUM ('FULL', 'EMERGENCY', 'EXAMS', 'PRESCRIPTIONS');

-- Conversao dos textos livres antigos. Valor desconhecido cai em EMERGENCY,
-- que e o mais restritivo: quando nao da para determinar o que a pessoa
-- deveria ver, o sistema nega em vez de liberar.
ALTER TABLE "access_requests"
  ALTER COLUMN "scope" TYPE "AccessScope"
  USING (
    CASE
      WHEN "scope" = 'Prontuário completo' THEN 'FULL'
      WHEN "scope" LIKE 'Dados de emergência%' THEN 'EMERGENCY'
      WHEN "scope" = 'Exames laboratoriais' THEN 'EXAMS'
      WHEN "scope" = 'Exames de imagem' THEN 'EXAMS'
      WHEN "scope" = 'Receitas e prescrições' THEN 'PRESCRIPTIONS'
      ELSE 'EMERGENCY'
    END
  )::"AccessScope";

ALTER TABLE "access_tokens"
  ALTER COLUMN "scope" TYPE "AccessScope"
  USING (
    CASE
      WHEN "scope" = 'Prontuário completo' THEN 'FULL'
      WHEN "scope" LIKE 'Dados de emergência%' THEN 'EMERGENCY'
      WHEN "scope" = 'Exames laboratoriais' THEN 'EXAMS'
      WHEN "scope" = 'Exames de imagem' THEN 'EXAMS'
      WHEN "scope" = 'Receitas e prescrições' THEN 'PRESCRIPTIONS'
      ELSE 'EMERGENCY'
    END
  )::"AccessScope";
