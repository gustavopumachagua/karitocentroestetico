/**
 * Helpers for associating operational records with the signed-in
 * professional.
 *
 * New treatment records persist `profesionalId`, which remains stable when a
 * profile name changes. Older rows only have the display name, so they keep a
 * deliberately limited fallback until they are migrated.
 */

import { getEntityId, getProfessionalId } from "./professionalDirectory";

export { getProfessionalId } from "./professionalDirectory";

const normalizeText = (value) =>
  typeof value === "string" ? value.trim().toLocaleLowerCase() : "";

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(value);

export const getAuthenticatedProfessionalId = (user) => getEntityId(user);

/**
 * Determines ownership from the immutable id whenever it is available. A
 * name comparison is only allowed for legacy records with no owner id.
 */
export const belongsToProfessional = (record, user) => {
  if (!record || !user) return false;

  const userId = getAuthenticatedProfessionalId(user);
  const recordProfessionalId = getProfessionalId(record);
  if (recordProfessionalId) {
    return Boolean(userId && recordProfessionalId === userId);
  }

  const rawProfessional = record.profesional;
  if (typeof rawProfessional !== "string") return false;

  const normalizedProfessional = rawProfessional.trim();
  if (isMongoObjectId(normalizedProfessional)) {
    return Boolean(userId && normalizedProfessional === userId);
  }

  const profileName = normalizeText(user.nombre);
  return Boolean(
    profileName && normalizeText(normalizedProfessional) === profileName,
  );
};

/**
 * Retains the specialty guard used by each dashboard while tolerating old
 * treatment records that did not persist a role yet.
 */
export const belongsToProfessionalRole = (record, user) => {
  if (!belongsToProfessional(record, user)) return false;

  const recordRole = normalizeText(record?.rol);
  const userRole = normalizeText(user?.rol);
  return !recordRole || !userRole || recordRole === userRole;
};
