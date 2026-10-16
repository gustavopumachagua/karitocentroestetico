/** Canonical, editable rows shared by the clinical form, review guide and PDF. */
export const MAX_CLINICAL_EXAM_ROWS = 100;
export const LEGACY_CLINICAL_EXAMS = [
  ["Glucosa en ayunas", "glucosaAyunas"], ["HbA1c", "hba1c"],
  ["Creatinina", "creatinina"], ["TFGe / eGFR", "tfge"],
  ["TGO / AST", "tgoAst"], ["TGP / ALT", "tgpAlt"],
  ["Colesterol total", "colesterolTotal"], ["LDL", "ldl"],
  ["HDL", "hdl"], ["Triglicéridos", "trigliceridos"],
  ["TSH", "tsh"], ["Otros exámenes", "otrosExamenes"],
];

export const createClinicalExamRow = () => ({ examen: "", resultado: "" });
const text = (value) => typeof value === "string" ? value : "";
export const hasClinicalExamRows = (data) => Object.hasOwn(data || {}, "examenesAuxiliares");

/** A present new collection is authoritative, including an empty list. */
export function getClinicalExamRows(data = {}) {
  if (hasClinicalExamRows(data)) {
    return Array.isArray(data.examenesAuxiliares)
      ? data.examenesAuxiliares.map((row) => ({ examen: text(row?.examen), resultado: text(row?.resultado) }))
      : [];
  }
  return LEGACY_CLINICAL_EXAMS
    .filter(([, key]) => String(data[key] ?? "").trim())
    .map(([examen, key]) => ({ examen, resultado: String(data[key]) }));
}

export function getEditableClinicalExamRows(data) {
  const rows = getClinicalExamRows(data);
  return rows.length ? rows : [createClinicalExamRow()];
}

export function getFilledClinicalExamRows(data) {
  return getClinicalExamRows(data).filter((row) => row.examen.trim() || row.resultado.trim());
}

/** Field identifiers also match the inputs used by the pending-question guide. */
export function getClinicalExamIssues(data = {}) {
  const rows = getClinicalExamRows(data);
  const issues = [];
  if (rows.length > MAX_CLINICAL_EXAM_ROWS) issues.push({ field: "examenesAuxiliares", label: "Máximo 100 exámenes auxiliares" });
  if (!rows.some((row) => row.examen.trim() && row.resultado.trim())) {
    issues.push({ field: "examenesAuxiliares", label: "Registre al menos un examen y su resultado" });
  }
  rows.forEach((row, index) => {
    if (!row.examen.trim() && !row.resultado.trim()) return;
    if (!row.examen.trim() || row.examen.length > 160) issues.push({ field: `examenesAuxiliares-${index}-examen`, label: `Examen de la fila ${index + 1} (1–160 caracteres)` });
    if (!row.resultado.trim() || row.resultado.length > 2000) issues.push({ field: `examenesAuxiliares-${index}-resultado`, label: `Resultado de la fila ${index + 1} (1–2000 caracteres)` });
  });
  return issues;
}
