export const NUTRITION_DAYS = Object.freeze([
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
]);
export const NUTRITION_MEALS = Object.freeze([
  { key: "desayuno", label: "Desayuno" },
  { key: "mediaManana", label: "Media mañana" },
  { key: "almuerzo", label: "Almuerzo" },
  { key: "mediaTarde", label: "Media tarde" },
  { key: "cena", label: "Cena" },
]);
export const NUTRITION_INDICATORS = Object.freeze([
  { key: "edad", label: "Edad (años)", unit: "años" },
  { key: "peso", label: "Peso (kg)", unit: "kg" },
  { key: "talla", label: "Talla (m)", unit: "m" },
  { key: "imc", label: "IMC (kg/m²)", unit: "kg/m²" },
]);
export const NUTRITION_BRAND = "KARITO BEAUTY ESTHETIC CENTER S.A.C.";

const text = (value) => value == null ? "" : String(value);
export const isClinicalHistoryId = (value) => /^[a-f\d]{24}$/iu.test(text(value));

/** Canonical order is shared by the editor, preview, API and vector document. */
export function createNutritionDraft(seguimiento = {}, plan = null) {
  return {
    indicadores: Object.fromEntries(NUTRITION_INDICATORS.map(({ key }) => [
      key, text(plan?.indicadores?.[key] ?? seguimiento.indicadores?.[key]),
    ])),
    semana: NUTRITION_DAYS.map((dia) => {
      const source = plan?.semana?.find((row) => row.dia === dia);
      return { dia, ...Object.fromEntries(NUTRITION_MEALS.map(({ key }) => [key, text(source?.[key])])) };
    }),
    indicaciones: text(plan?.indicaciones),
  };
}

export function validateNutritionDraft(draft) {
  const errors = [];
  for (const { key, label } of NUTRITION_INDICATORS) {
    const value = text(draft.indicadores?.[key]).trim();
    const number = Number(value.replace(",", "."));
    const valid = key === "edad"
      ? /^\d{1,3}$/u.test(value) && number >= 18 && number <= 130
      : value.length <= 12 && /^\d+(?:[.,]\d+)?$/u.test(value) && Number.isFinite(number) && number > 0;
    if (!valid) errors.push({ id: `nutrition-${key}`, label: key === "edad" ? "Edad: ingresa de 18 a 130 años" : `${label}: ingresa un número mayor que cero` });
  }
  NUTRITION_DAYS.forEach((dia, index) => {
    for (const { key, label } of NUTRITION_MEALS) {
      const value = text(draft.semana?.[index]?.[key]).trim();
      if (!value) errors.push({ id: `nutrition-${index}-${key}`, label: `${dia}: ${label.toLocaleLowerCase("es")}` });
      else if (value.length > 1500) errors.push({ id: `nutrition-${index}-${key}`, label: `${dia}: ${label}, máximo 1500 caracteres` });
    }
  });
  if (!text(draft.indicaciones).trim()) errors.push({ id: "nutrition-indicaciones", label: "Indicaciones del plan" });
  else if (draft.indicaciones.length > 4000) errors.push({ id: "nutrition-indicaciones", label: "Indicaciones: máximo 4000 caracteres" });
  return errors;
}

export function nutritionPlanPayload(draft, revision, estado) {
  return {
    estado,
    revision,
    indicadores: Object.fromEntries(NUTRITION_INDICATORS.map(({ key }) => [key, text(draft.indicadores[key]).trim().replace(",", ".")])),
    semana: NUTRITION_DAYS.map((dia, index) => ({
      dia, ...Object.fromEntries(NUTRITION_MEALS.map(({ key }) => [key, text(draft.semana[index]?.[key]).trim()])),
    })),
    indicaciones: text(draft.indicaciones).trim(),
  };
}

export function nutritionDocumentModel(seguimiento, draft, plan = null) {
  return {
    brand: NUTRITION_BRAND,
    title: "Plan alimentario semanal orientativo",
    paciente: text(seguimiento?.paciente?.nombre) || "Paciente",
    sexo: text(seguimiento?.paciente?.sexo),
    indicadores: NUTRITION_INDICATORS.map(({ key, label, unit }) => ({ key, label, value: text(draft.indicadores?.[key]), unit })),
    semana: NUTRITION_DAYS.map((dia, index) => ({
      dia, comidas: NUTRITION_MEALS.map(({ key, label }) => ({ key, label, value: text(draft.semana?.[index]?.[key]) })),
    })),
    indicaciones: text(draft.indicaciones),
    finalizadoEn: plan?.finalizadoEn || null,
  };
}

export function nutritionPdfFilename(name) {
  const suffix = text(name).normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z\d]+/giu, "-").replace(/^-|-$/gu, "").slice(0, 70);
  return `Plan-alimentario-${suffix || "paciente"}.pdf`;
}
