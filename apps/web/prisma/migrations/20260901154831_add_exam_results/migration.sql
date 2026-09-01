-- CreateTable
CREATE TABLE "exam_results" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "analyte" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "reference_min" DOUBLE PRECISION NOT NULL,
    "reference_max" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "medical_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_exam_results_document"
  ON "exam_results"("document_id");

ALTER TABLE "exam_results" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_results_authorized_select"
  ON "exam_results"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM "medical_documents"
      WHERE "medical_documents"."id" = "exam_results"."document_id"
        AND can_access_patient("medical_documents"."patient_id")
    )
  );
