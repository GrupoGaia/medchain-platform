import { cookies } from "next/headers";

export const SESSION_COOKIE = "medchain_doctor_id";

export async function getDoctorIdFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
