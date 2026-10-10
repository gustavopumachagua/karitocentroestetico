const OBJECT_ID = /^[a-f\d]{24}$/i;

/** Retain the persisted appointment reference, never a browser-created patient ID. */
export function normalizePatientSuggestions(data) {
  const suggestions = new Map();
  for (const item of Array.isArray(data) ? data : []) {
    const nombre = typeof item?.nombre === "string" ? item.nombre.trim() : "";
    if (!nombre) continue;
    const citaPacienteId = typeof item.citaPacienteId === "string" && OBJECT_ID.test(item.citaPacienteId)
      ? item.citaPacienteId : undefined;
    const key = citaPacienteId ? `cita:${citaPacienteId}` : `nombre:${nombre.toLocaleLowerCase("es-PE")}`;
    if (!suggestions.has(key)) suggestions.set(key, { nombre, ...(citaPacienteId ? { citaPacienteId } : {}) });
  }
  return [...suggestions.values()];
}
