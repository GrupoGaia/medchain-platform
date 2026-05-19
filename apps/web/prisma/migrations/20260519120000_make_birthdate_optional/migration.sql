-- Aligns the database with PatientProfile.birthDate being optional in Prisma.
ALTER TABLE "patient_profiles" ALTER COLUMN "birth_date" DROP NOT NULL;
