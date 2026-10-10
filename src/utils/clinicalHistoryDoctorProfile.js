/**
 * Applies the current professional identity to a clinical-history view.
 *
 * The clinical answers belong to the historical record, while the doctor's
 * visible profile data (name, CMP and signature) is maintained in the
 * profile section. Keeping this small transformation at the presentation
 * boundary lets an already finalized document display the doctor's latest
 * authorized details without rewriting any patient answers in the browser.
 */

const getText = (value) => (typeof value === "string" ? value.trim() : "");

const getProfileName = (profile) => getText(profile?.nombre);
const getProfileCmp = (profile) => getText(profile?.cmp);
const getProfileSignature = (profile) => getText(profile?.firmaDigital);

export function applyDoctorProfileToFormData(formData, profile) {
  if (!formData || typeof formData !== "object") return formData || {};

  const name = getProfileName(profile);
  const cmp = getProfileCmp(profile);

  if (!name && !cmp) return formData;

  const nameAlreadyApplied =
    !name ||
    (formData.medicoTratante === name && formData.nombreFirmaMedico === name);
  const cmpAlreadyApplied = !cmp || formData.cmpConstancia === cmp;
  if (nameAlreadyApplied && cmpAlreadyApplied) return formData;

  const nextFormData = { ...formData };
  if (name) {
    nextFormData.medicoTratante = name;
    nextFormData.nombreFirmaMedico = name;
  }
  if (cmp) nextFormData.cmpConstancia = cmp;

  return nextFormData;
}

/**
 * Returns a display/download copy of a record with the current doctor
 * profile. The persisted record is deliberately not mutated: callers can
 * still use it as the durable clinical snapshot for synchronization.
 */
export function applyDoctorProfileToClinicalHistory(record, profile) {
  if (!record || typeof record !== "object") return record || null;

  const name = getProfileName(profile);
  const cmp = getProfileCmp(profile);
  const profileSignature = getProfileSignature(profile);
  const formData = applyDoctorProfileToFormData(record.formData, profile);
  const signatureUrl = profileSignature || record.signatureUrl || "";
  const currentSignature = record.firmaMedico || {};
  const shouldRefreshSignatureMetadata =
    Boolean(name || cmp || profileSignature) &&
    (currentSignature.nombre !== name ||
      currentSignature.cmp !== cmp ||
      currentSignature.url !== signatureUrl);

  if (
    formData === record.formData &&
    signatureUrl === record.signatureUrl &&
    !shouldRefreshSignatureMetadata
  ) {
    return record;
  }

  return {
    ...record,
    formData,
    signatureUrl,
    // Keep the same profile details in the signature metadata as well. The
    // current vector renderer uses `signatureUrl`, while legacy/server PDF
    // consumers can still read `firmaMedico` safely from this view model.
    ...(shouldRefreshSignatureMetadata
      ? {
          firmaMedico: {
            ...currentSignature,
            ...(name ? { nombre: name } : {}),
            ...(cmp ? { cmp } : {}),
            ...(profileSignature ? { url: profileSignature } : {}),
          },
        }
      : {}),
  };
}
