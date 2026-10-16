/**
 * Configuración de los pasos del formulario de historia clínica.
 * Cada paso define su número de sección (romano), título y campos.
 */

export const FORM_TITLE = "HISTORIA CLÍNICA";
export const FORM_SUBTITLE = "EVALUACIÓN PARA MANEJO DE PESO CON TIRZEPATIDA";

export const STEPS = [
  {
    id: "datos-identificacion",
    section: "I",
    title: "DATOS DE IDENTIFICACIÓN",
  },
  {
    id: "motivo-consulta",
    section: "II",
    title: "MOTIVO DE CONSULTA",
  },
  {
    id: "historia-peso",
    section: "III",
    title: "HISTORIA Y EVOLUCIÓN DEL PESO",
  },
  {
    id: "antecedentes-personales",
    section: "IV",
    title: "ANTECEDENTES PERSONALES",
  },
  {
    id: "antecedentes-familiares",
    section: "V",
    title: "ANTECEDENTES FAMILIARES",
  },
  {
    id: "gineco-obstetricos",
    section: "VI",
    title: "ANTECEDENTES GINECO-OBSTÉTRICOS",
  },
  {
    id: "medicacion-actual",
    section: "VII",
    title: "MEDICACIÓN ACTUAL Y TRATAMIENTOS PREVIOS",
  },
  {
    id: "habitos-estilo",
    section: "VIII",
    title: "HÁBITOS Y ESTILO DE VIDA",
  },
  {
    id: "sintomas-actuales",
    section: "IX",
    title: "SÍNTOMAS ACTUALES",
  },
  {
    id: "evaluacion-seguridad",
    section: "X",
    title: "EVALUACIÓN DE SEGURIDAD PREVIA AL INICIO",
  },
  {
    id: "evaluacion-clinica",
    section: "XI",
    title: "EVALUACIÓN CLÍNICA",
  },
  {
    id: "examenes-auxiliares",
    section: "XII",
    title: "EXÁMENES AUXILIARES",
  },
  {
    id: "evaluacion-medica",
    section: "XIII",
    title: "EVALUACIÓN MÉDICA",
  },
  {
    id: "conducta-plan",
    section: "XIV",
    title: "CONDUCTA Y PLAN",
  },
  {
    id: "constancia-medica",
    section: "XV",
    title: "CONSTANCIA MÉDICA",
  },
];

const ROMAN_SECTIONS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
];

export const GYNECO_STEP_ID = "gineco-obstetricos";

/** Whether the patient requires the gyneco-obstetric section. */
export function isFemalePatient(sexo) {
  const normalized = String(sexo || "")
    .trim()
    .toLocaleLowerCase("es-PE");

  return ["f", "femenino", "mujer", "female"].includes(normalized);
}

/**
 * Returns only the sections relevant to the patient and re-numbers them so
 * the document never contains a gap when the gyneco-obstetric section is not
 * applicable.
 */
export function getVisibleSteps(sexo) {
  const visibleSteps = isFemalePatient(sexo)
    ? STEPS
    : STEPS.filter((step) => step.id !== GYNECO_STEP_ID);

  return visibleSteps.map((step, index) => ({
    ...step,
    section: ROMAN_SECTIONS[index],
  }));
}

export const createTreatmentRow = () => ({
  medicamento: "",
  dosis: "",
  tiempoUso: "",
  resultado: "",
});

const toFieldText = (value) => (value === null || value === undefined ? "" : String(value));

const treatmentRowHasValue = (row) =>
  Object.values(row || {}).some((value) => toFieldText(value).trim().length > 0);

/**
 * Older drafts created three empty treatment rows by default. Collapse only
 * those empty placeholders while retaining every row that contains clinical
 * data, and always leave one editable row available.
 */
export function normalizeTreatmentRows(rows) {
  const normalizedRows = Array.isArray(rows)
    ? rows.map((row) => ({
        medicamento: toFieldText(row?.medicamento),
        dosis: toFieldText(row?.dosis),
        tiempoUso: toFieldText(row?.tiempoUso),
        resultado: toFieldText(row?.resultado),
      }))
    : [];
  const filledRows = normalizedRows.filter(treatmentRowHasValue);

  return filledRows.length ? filledRows : [createTreatmentRow()];
}

const LEGACY_DIAGNOSIS_KEYS = ["diagnostico1", "diagnostico2", "diagnostico3"];

/**
 * Reads both the new expandable diagnosis list and the three legacy fields.
 * This lets prior drafts retain their diagnoses while all new edits use one
 * extensible collection.
 */
export function normalizeDiagnosisValues(formData = {}) {
  const storedValues = Array.isArray(formData?.diagnosticos)
    ? formData.diagnosticos.map(toFieldText)
    : [];
  const legacyValues = LEGACY_DIAGNOSIS_KEYS.map((key) => toFieldText(formData?.[key]));

  if (storedValues.some((value) => value.trim().length > 0)) {
    return storedValues;
  }

  const filledLegacyValues = legacyValues.filter((value) => value.trim().length > 0);
  return filledLegacyValues.length ? filledLegacyValues : [""];
}

/**
 * Keeps the first three legacy keys synchronized for the existing API and
 * historical records while permitting any number of diagnoses in the UI.
 */
export function withLegacyDiagnosisFields(formData = {}) {
  const diagnosticos = normalizeDiagnosisValues(formData);
  const formDataWithoutDiagnosisFields = Object.fromEntries(
    Object.entries(formData).filter(([key]) => !/^diagnostico\d+$/.test(key)),
  );
  const indexedDiagnosisFields = Object.fromEntries(
    diagnosticos.map((diagnostico, index) => [
      `diagnostico${index + 1}`,
      diagnostico,
    ]),
  );

  return {
    ...formDataWithoutDiagnosisFields,
    diagnosticos,
    ...indexedDiagnosisFields,
  };
}

export const INITIAL_FORM_DATA = {
  // I. Datos de Identificación
  nombreCompleto: "",
  sexo: "",
  dni: "",
  fechaNacimiento: "",
  edad: "",
  telefono: "",
  ocupacion: "",
  fechaConsulta: "",
  medicoTratante: "",

  // II. Motivo de Consulta
  motivoPrincipal: "",
  motivoOtro: "",
  dificultadPeso: "",
  objetivoPaciente: "",

  // III. Historia y Evolución del Peso
  pesoMaximo: "",
  pesoHabitual: "",
  pesoActual: "",
  talla: "",
  imc: "",
  perimetroAbdominal: "",
  evolucionPeso: "",
  intentosPrevios: "",
  intentosOtros: "",
  tratamientosPreviosRespuesta: "",

  // IV. Antecedentes Personales
  enfermedadesAntecedentes: [],
  enfermedadesOtros: "",
  enfermedadesEspecificar: "",
  cirugiasPrevias: "",
  cirugiaProcedimiento: "",
  cirugiaFecha: "",
  cirugiaComplicaciones: "",
  hospitalizacionesPrevias: "",
  hospitalizacionMotivo: "",
  alergiaMedicamentos: "",
  alergiaMedicamento: "",
  alergiaReaccion: "",
  alergiasAlimentarias: "",
  alergiaAlimentariaCual: "",
  alergiaLatex: "",
  alergiaLatexOtras: "",
  reaccionesAdversas: "",
  reaccionAdversaMedicamento: "",
  transfusionesSanguineas: "",

  // V. Antecedentes Familiares
  antecedentesFamiliares: [],
  familiaresOtros: "",
  familiaresEspecificar: "",

  // VI. Antecedentes Gineco-Obstétricos
  fum: "",
  g: "",
  p: "",
  c: "",
  a: "",
  metodoAnticonceptivo: "",
  embarazoActual: "",
  posibilidadEmbarazo: "",
  lactancia: "",

  // VII. Medicación Actual
  medicamentosActuales: "",
  suplementosVitaminas: "",
  tratamientosPreviosPeso: [createTreatmentRow()],
  agonistasGlp1: "",
  agonistaMedicamento: "",
  agonistaDosis: "",
  agonistaRespuesta: "",

  // VIII. Hábitos y Estilo de Vida
  alimentacionHabitual: "",
  comidasDia: "",
  sensacionHambre: "",
  antojosPicoteo: "",
  actividadFisica: "",
  actividadFrecuencia: "",
  horasSueno: "",
  calidadSueno: "",
  consumoAlcohol: "",
  observacionesHabitos: "",

  // IX. Síntomas Actuales
  sintomasActuales: [],
  otrosSintomas: "",

  // X. Evaluación de Seguridad
  carcinomaMedularPersonal: "",
  carcinomaMedularFamiliar: "",
  men2PersonalFamiliar: "",
  enfermedadTiroideaConocida: "",
  pancreatitisPrevia: "",
  dolorAbdominalRecurrente: "",
  litiasisVesicular: "",
  colecistitis: "",
  cirugiaVesicula: "",
  enfermedadHepatica: "",
  ictericiaPrevia: "",
  gastroparesia: "",
  enfermedadGiImportante: "",
  enfermedadRenal: "",
  deshidratacionReciente: "",
  hipoglucemiasPrevias: "",
  insulina: "",
  sulfonilureas: "",
  otrosMedDiabetes: "",
  otrosMedPeso: "",

  // XI. Evaluación Clínica
  presionSistolica: "",
  presionDiastolica: "",
  frecuenciaCardiaca: "",
  pesoClinico: "",
  tallaClinica: "",
  imcClinico: "",
  perimetroAbdominalClinico: "",
  examenFisico: "",

  // XII. Exámenes Auxiliares
  fechaLaboratorio: "",
  examenesAuxiliares: [{ examen: "", resultado: "" }],
  glucosaAyunas: "",
  hba1c: "",
  creatinina: "",
  tfge: "",
  tgoAst: "",
  tgpAlt: "",
  colesterolTotal: "",
  ldl: "",
  hdl: "",
  trigliceridos: "",
  tsh: "",
  otrosExamenes: "",

  // XIII. Evaluación Médica
  diagnosticos: [""],
  diagnostico1: "",
  diagnostico2: "",
  diagnostico3: "",
  comorbilidades: "",
  factoresRiesgo: "",
  observacionesClinicas: "",

  // XIV. Conducta y Plan
  conductaPlan: [],
  conductaOtro: "",
  medicamentoIndicado: "",
  presentacion: "",
  dosisInicial: "",
  fechaInicioTratamiento: "",
  proximoControl: "",
  indicacionesObservaciones: "",

  // XV. Constancia Médica
  consentimientoInformado: "",
  consentimientoFecha: "",
  observacionesAdicionales: "",
  nombreFirmaMedico: "",
  cmpConstancia: "",
  fechaConstancia: "",
};
