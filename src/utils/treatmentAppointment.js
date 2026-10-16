/** Appointment ids, not editable names, identify the patient being attended. */
export function getTreatmentAppointmentId(appointment) {
  return String(appointment?._id || appointment?.id || "");
}

function appointmentTime(appointment) {
  const rawDate = appointment?.fecha;
  const value = typeof rawDate === "string" ? rawDate.replace(" ", "T") : rawDate;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

/** Preserve an explicitly selected own pending visit before suggesting another. */
export function selectTreatmentAppointment(appointments, selected, now = Date.now()) {
  const eligible = (Array.isArray(appointments) ? appointments : [])
    .filter((appointment) => getTreatmentAppointmentId(appointment));
  const selectedId = getTreatmentAppointmentId(selected);
  const existing = selectedId
    ? eligible.find((appointment) => getTreatmentAppointmentId(appointment) === selectedId)
    : null;
  if (existing) return existing;

  return eligible.reduce((closest, appointment) => {
    if (!closest) return appointment;
    const currentTime = appointmentTime(appointment);
    const closestTime = appointmentTime(closest);
    if (currentTime === null) return closest;
    if (closestTime === null) return appointment;
    return Math.abs(currentTime - now) < Math.abs(closestTime - now)
      ? appointment : closest;
  }, null);
}

export function normalizeTreatmentSex(value) {
  const normalized = String(value || "").trim().toLocaleLowerCase("es-PE");
  if (["femenino", "mujer", "f", "female"].includes(normalized)) return "Femenino";
  if (["masculino", "hombre", "m", "male"].includes(normalized)) return "Masculino";
  return "";
}

/** Fill missing demographics only: a delayed lookup never overwrites user input. */
export function fillTreatmentPatient(form, patient) {
  if (!patient) return form;
  return {
    ...form,
    nombre: patient.nombre || form.nombre,
    sexo: form.sexo || normalizeTreatmentSex(patient.sexo),
    celular: form.celular || patient.celular || "",
  };
}
