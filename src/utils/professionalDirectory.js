/**
 * Helpers for resolving the current display name of a professional.
 *
 * Treatment documents retain a `profesional` snapshot for legacy records,
 * while newer records also carry the immutable `profesionalId`.  A name can
 * change over time, so screens that only need to display the professional
 * should prefer the current directory entry when that stable id exists.
 */

export function getEntityId(value) {
  if (value && typeof value === "object") {
    return String(value._id || value.id || "").trim();
  }

  return String(value || "").trim();
}

export function createProfessionalNameIndex(professionals) {
  return (Array.isArray(professionals) ? professionals : []).reduce(
    (index, professional) => {
      const id = getEntityId(professional);
      const name = String(professional?.nombre || "").trim();

      if (id && name) index.set(id, name);
      return index;
    },
    new Map(),
  );
}

export function getProfessionalId(record) {
  const directId = getEntityId(record?.profesionalId);
  if (directId) return directId;

  const candidates = [
    record?.profesional,
    record?.cita?.profesionalId,
    record?.cita?.profesional,
    record?.citaId?.profesionalId,
    record?.citaId?.profesional,
  ];

  for (const professional of candidates) {
    const id = getEntityId(professional);
    if (
      id &&
      (typeof professional === "object" || /^[a-f\d]{24}$/i.test(id))
    ) {
      return id;
    }
  }

  return "";
}

export function getProfessionalRole(record) {
  return String(
    record?.rol ||
      record?.profesional?.rol ||
      record?.cita?.rol ||
      record?.cita?.profesional?.rol ||
      "",
  )
    .trim()
    .toLocaleLowerCase();
}

export function getProfessionalDisplayName(record, namesById) {
  const currentName = namesById?.get?.(getProfessionalId(record));
  if (currentName) return currentName;

  // Populated relationships are live identities; the string stored on a
  // treatment is only a historical snapshot and may contain an earlier name.
  const liveProfessionals = [
    record?.profesionalId,
    record?.profesional,
    record?.cita?.profesional,
    record?.citaId?.profesional,
  ];
  for (const professional of liveProfessionals) {
    if (professional && typeof professional === "object") {
      const name = String(professional.nombre || professional.email || "").trim();
      if (name) return name;
    }
  }

  const legacyName =
    typeof record?.profesional === "string" ? record.profesional.trim() : "";
  // An unresolved object id is an implementation detail, not a meaningful
  // professional label.  It will be resolved as soon as the directory loads.
  return /^[a-f\d]{24}$/i.test(legacyName) ? "" : legacyName;
}
