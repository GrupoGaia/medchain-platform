-- Helper functions keep policies readable and avoid recursive RLS checks.
CREATE OR REPLACE FUNCTION current_auth_uid()
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  uid text;
BEGIN
  IF to_regprocedure('auth.uid()') IS NULL THEN
    RETURN NULL;
  END IF;

  EXECUTE 'SELECT auth.uid()::text' INTO uid;
  RETURN uid;
END;
$$;

CREATE OR REPLACE FUNCTION current_db_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "id"
  FROM "users"
  WHERE "authId" = current_auth_uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION current_patient_profile_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "id"
  FROM "patient_profiles"
  WHERE "user_id" = current_db_user_id()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION current_professional_profile_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "id"
  FROM "health_professional_profiles"
  WHERE "user_id" = current_db_user_id()
  LIMIT 1
$$;

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
  )
$$;

CREATE OR REPLACE FUNCTION has_active_token_for_patient(target_patient_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "access_tokens"
    WHERE "patient_id" = target_patient_id
      AND "professional_id" = current_professional_profile_id()
      AND "status" = 'ACTIVE'
      AND "expires_at" > now()
  )
$$;

CREATE OR REPLACE FUNCTION can_access_patient(target_patient_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT target_patient_id = current_patient_profile_id()
    OR is_emergency_contact_for_patient(target_patient_id)
    OR has_active_token_for_patient(target_patient_id)
$$;

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "patient_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "emergency_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "health_professional_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "institutions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "medical_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "access_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "access_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "access_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_self_select"
  ON "users"
  FOR SELECT
  TO authenticated
  USING ("id" = current_db_user_id());

CREATE POLICY "patient_profiles_authorized_select"
  ON "patient_profiles"
  FOR SELECT
  TO authenticated
  USING (can_access_patient("id"));

CREATE POLICY "emergency_contacts_authorized_select"
  ON "emergency_contacts"
  FOR SELECT
  TO authenticated
  USING (can_access_patient("patient_id") OR "user_id" = current_db_user_id());

CREATE POLICY "health_professional_profiles_authenticated_select"
  ON "health_professional_profiles"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "institutions_authenticated_select"
  ON "institutions"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "medical_documents_authorized_select"
  ON "medical_documents"
  FOR SELECT
  TO authenticated
  USING (can_access_patient("patient_id"));

CREATE POLICY "access_requests_authorized_select"
  ON "access_requests"
  FOR SELECT
  TO authenticated
  USING (
    can_access_patient("patient_id")
    OR "professional_id" = current_professional_profile_id()
  );

CREATE POLICY "access_tokens_authorized_select"
  ON "access_tokens"
  FOR SELECT
  TO authenticated
  USING (
    can_access_patient("patient_id")
    OR "professional_id" = current_professional_profile_id()
  );

CREATE POLICY "access_logs_authorized_select"
  ON "access_logs"
  FOR SELECT
  TO authenticated
  USING (can_access_patient("patient_id"));

CREATE INDEX IF NOT EXISTS "idx_emergency_contacts_user"
  ON "emergency_contacts"("user_id");

CREATE INDEX IF NOT EXISTS "idx_emergency_contacts_patient"
  ON "emergency_contacts"("patient_id");

CREATE INDEX IF NOT EXISTS "idx_access_tokens_patient_prof_status"
  ON "access_tokens"("patient_id", "professional_id", "status");

CREATE INDEX IF NOT EXISTS "idx_access_tokens_expires_at"
  ON "access_tokens"("expires_at");

CREATE INDEX IF NOT EXISTS "idx_access_requests_patient_status"
  ON "access_requests"("patient_id", "status");

CREATE INDEX IF NOT EXISTS "idx_access_requests_professional_status"
  ON "access_requests"("professional_id", "status");

CREATE INDEX IF NOT EXISTS "idx_medical_documents_patient"
  ON "medical_documents"("patient_id");

CREATE INDEX IF NOT EXISTS "idx_access_logs_patient"
  ON "access_logs"("patient_id");
