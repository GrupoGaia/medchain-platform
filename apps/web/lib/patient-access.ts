import { contactLinkGrantsAccess } from "@medchain/domain";

export interface UserPatientAccess {
  patientProfile?: { id: string } | null;
  contactFor?: Array<{ patientId: string; status: string }> | null;
}

export function getManagedPatientIds(user: UserPatientAccess): string[] {
  const ids = new Set<string>();

  if (user.patientProfile?.id) {
    ids.add(user.patientProfile.id);
  }

  // So o vinculo aprovado pelo paciente conta. Antes bastava existir uma linha
  // em emergency_contacts, e qualquer um criava a sua via POST /api/users.
  for (const contact of user.contactFor ?? []) {
    if (contactLinkGrantsAccess(contact.status)) {
      ids.add(contact.patientId);
    }
  }

  return Array.from(ids);
}

export function canManagePatient(user: UserPatientAccess, patientId: string): boolean {
  return getManagedPatientIds(user).includes(patientId);
}
