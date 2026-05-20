export interface UserPatientAccess {
  patientProfile?: { id: string } | null;
  contactFor?: Array<{ patientId: string }> | null;
}

export function getManagedPatientIds(user: UserPatientAccess): string[] {
  const ids = new Set<string>();

  if (user.patientProfile?.id) {
    ids.add(user.patientProfile.id);
  }

  for (const contact of user.contactFor ?? []) {
    ids.add(contact.patientId);
  }

  return Array.from(ids);
}

export function canManagePatient(user: UserPatientAccess, patientId: string): boolean {
  return getManagedPatientIds(user).includes(patientId);
}
