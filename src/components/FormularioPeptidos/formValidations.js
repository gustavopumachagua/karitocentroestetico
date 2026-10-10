/**
 * Validation functions for each form step.
 * Returns true if the step is valid and the user can proceed.
 */
import { normalizeDiagnosisValues } from "./formConfig";
import {
  isAdultAge,
  isAdultBirthDate,
  isAgeConsistentWithBirthDate,
} from "./birthDateAge";

/** I. Datos de Identificación */
export function validateDatosIdentificacion(d) {
  return (
    d.nombreCompleto.trim().length > 0 &&
    d.sexo.trim().length > 0 &&
    /^\d{8}$/.test(d.dni) &&
    isAdultBirthDate(d.fechaNacimiento) &&
    isAdultAge(d.edad) &&
    isAgeConsistentWithBirthDate(d.fechaNacimiento, d.edad) &&
    d.telefono.trim().length > 0 &&
    d.ocupacion.trim().length > 0 &&
    d.fechaConsulta.length > 0 &&
    d.medicoTratante.trim().length > 0
  );
}

/** II. Motivo de Consulta */
export function validateMotivoConsulta(d) {
  const motivoOk =
    d.motivoPrincipal.length > 0 &&
    (d.motivoPrincipal !== "Otro" || d.motivoOtro.trim().length > 0);
  return (
    motivoOk &&
    d.dificultadPeso.trim().length > 0 &&
    d.objetivoPaciente.trim().length > 0
  );
}

/** III. Historia y Evolución del Peso */
export function validateHistoriaPeso(d) {
  const numOk = (v) => v.length > 0 && /^\d+(\.\d+)?$/.test(v);
  return (
    numOk(d.pesoMaximo) &&
    numOk(d.pesoHabitual) &&
    numOk(d.pesoActual) &&
    numOk(d.talla) &&
    numOk(d.imc) &&
    numOk(d.perimetroAbdominal) &&
    d.evolucionPeso.trim().length > 0 &&
    d.intentosPrevios.length > 0 &&
    (d.intentosPrevios !== "Otro" || d.intentosOtros.trim().length > 0) &&
    d.tratamientosPreviosRespuesta.trim().length > 0
  );
}

/** IV. Antecedentes Personales */
export function validateAntecedentesPersonales(d) {
  if (d.enfermedadesAntecedentes.length === 0) return false;
  if (d.enfermedadesAntecedentes.includes("Otros") && !d.enfermedadesOtros.trim()) return false;
  if (!d.cirugiasPrevias) return false;
  if (d.cirugiasPrevias === "Sí" && (!d.cirugiaProcedimiento.trim() || !d.cirugiaFecha)) return false;
  if (!d.hospitalizacionesPrevias) return false;
  if (d.hospitalizacionesPrevias === "Sí" && !d.hospitalizacionMotivo.trim()) return false;
  if (!d.alergiaMedicamentos) return false;
  if (d.alergiaMedicamentos === "Sí" && (!d.alergiaMedicamento.trim() || !d.alergiaReaccion.trim())) return false;
  if (!d.alergiasAlimentarias) return false;
  if (d.alergiasAlimentarias === "Sí" && !d.alergiaAlimentariaCual.trim()) return false;
  if (!d.alergiaLatex) return false;
  if (!d.reaccionesAdversas) return false;
  if (d.reaccionesAdversas === "Sí" && !d.reaccionAdversaMedicamento.trim()) return false;
  if (!d.transfusionesSanguineas) return false;
  return true;
}

/** V. Antecedentes Familiares */
export function validateAntecedentesFamiliares(d) {
  if (d.antecedentesFamiliares.length === 0) return false;
  if (d.antecedentesFamiliares.includes("Otros") && !d.familiaresOtros.trim()) return false;
  if (!d.familiaresEspecificar.trim()) return false;
  return true;
}

/** VI. Antecedentes Gineco-Obstétricos */
export function validateGinecoObstetricos(d) {
  return (
    d.fum.trim().length > 0 &&
    d.g.trim().length > 0 &&
    d.p.trim().length > 0 &&
    d.c.trim().length > 0 &&
    d.a.trim().length > 0 &&
    d.metodoAnticonceptivo.trim().length > 0 &&
    d.embarazoActual.length > 0 &&
    d.posibilidadEmbarazo.length > 0 &&
    d.lactancia.length > 0
  );
}

/** VII. Medicación Actual y Tratamientos Previos */
export function validateMedicacionActual(d) {
  if (!d.medicamentosActuales.trim()) return false;
  if (!d.suplementosVitaminas.trim()) return false;
  if (!d.agonistasGlp1) return false;
  if (d.agonistasGlp1 === "Sí" && (!d.agonistaMedicamento.trim() || !d.agonistaDosis.trim() || !d.agonistaRespuesta.trim())) return false;
  return true;
}

/** VIII. Hábitos y Estilo de Vida */
export function validateHabitosEstilo(d) {
  if (!d.alimentacionHabitual) return false;
  if (!d.comidasDia.trim()) return false;
  if (!d.sensacionHambre) return false;
  if (!d.antojosPicoteo) return false;
  if (!d.actividadFisica) return false;
  if (d.actividadFisica === "Regular" && !d.actividadFrecuencia.trim()) return false;
  if (!d.horasSueno.trim()) return false;
  if (!d.calidadSueno) return false;
  if (!d.consumoAlcohol) return false;
  return true;
}

/** IX. Síntomas Actuales */
export function validateSintomasActuales(d) {
  return d.sintomasActuales.length > 0;
}

/** X. Evaluación de Seguridad Previa al Inicio */
export function validateEvaluacionSeguridad(d) {
  const fields = [
    "carcinomaMedularPersonal",
    "carcinomaMedularFamiliar",
    "men2PersonalFamiliar",
    "enfermedadTiroideaConocida",
    "pancreatitisPrevia",
    "dolorAbdominalRecurrente",
    "litiasisVesicular",
    "colecistitis",
    "cirugiaVesicula",
    "enfermedadHepatica",
    "ictericiaPrevia",
    "gastroparesia",
    "enfermedadGiImportante",
    "enfermedadRenal",
    "deshidratacionReciente",
    "hipoglucemiasPrevias",
    "insulina",
    "sulfonilureas",
    "otrosMedDiabetes",
    "otrosMedPeso",
  ];
  return fields.every((f) => d[f].length > 0);
}

/** XI. Evaluación Clínica */
export function validateEvaluacionClinica(d) {
  const numOk = (v) => v.length > 0 && /^\d+(\.\d+)?$/.test(v);
  return (
    numOk(d.presionSistolica) &&
    numOk(d.presionDiastolica) &&
    numOk(d.frecuenciaCardiaca) &&
    numOk(d.pesoClinico) &&
    numOk(d.tallaClinica) &&
    numOk(d.imcClinico) &&
    numOk(d.perimetroAbdominalClinico) &&
    d.examenFisico.trim().length > 0
  );
}

/** XII. Exámenes Auxiliares */
export function validateExamenesAuxiliares(d) {
  if (!d.fechaLaboratorio) return false;
  const fields = [
    "glucosaAyunas", "hba1c", "creatinina", "tfge",
    "tgoAst", "tgpAlt", "colesterolTotal", "ldl",
    "hdl", "trigliceridos", "tsh",
  ];
  return fields.every((f) => d[f].trim().length > 0);
}

/** XIII. Evaluación Médica */
export function validateEvaluacionMedica(d) {
  return (
    normalizeDiagnosisValues(d).some((diagnostico) => diagnostico.trim().length > 0) &&
    d.comorbilidades.trim().length > 0 &&
    d.factoresRiesgo.trim().length > 0 &&
    d.observacionesClinicas.trim().length > 0
  );
}

/** XIV. Conducta y Plan */
export function validateConductaPlan(d) {
  if (d.conductaPlan.length === 0) return false;
  if (d.conductaPlan.includes("Otros") && !d.conductaOtro.trim()) return false;
  if (!d.medicamentoIndicado.trim()) return false;
  if (!d.presentacion.trim()) return false;
  if (!d.dosisInicial.trim()) return false;
  if (!d.fechaInicioTratamiento) return false;
  if (!d.proximoControl) return false;
  return true;
}

/** XV. Constancia Médica */
export function validateConstanciaMedica(d) {
  return (
    d.consentimientoInformado.length > 0 &&
    d.consentimientoFecha.length > 0 &&
    d.fechaConstancia.length > 0
  );
}

const requiredQuestion = (field, label) => ({ field, label });
const isBlank = (value) => !String(value ?? "").trim();
const isEmptySelection = (value) =>
  !Array.isArray(value) || value.length === 0;
const isInvalidDecimal = (value) =>
  !/^\d+(\.\d+)?$/.test(String(value ?? "").trim());

/**
 * Returns the exact unanswered questions for a section. This complements the
 * boolean step validators above: the validation rules remain the source of
 * truth, while the UI can now guide the clinician directly to the answer that
 * needs attention instead of only naming a broad section.
 */
export function getMissingQuestions(stepId, d) {
  switch (stepId) {
    case "datos-identificacion": {
      const missing = [];
      if (isBlank(d.nombreCompleto)) {
        missing.push(requiredQuestion("nombreCompleto", "Nombre completo"));
      }
      if (isBlank(d.sexo)) {
        missing.push(
          requiredQuestion(
            "sexo",
            "Sexo del paciente (debe registrarse en el historial)",
          ),
        );
      }
      if (!/^\d{8}$/.test(String(d.dni ?? ""))) {
        missing.push(requiredQuestion("dni", "DNI válido de 8 dígitos"));
      }
      if (!isAdultBirthDate(d.fechaNacimiento)) {
        missing.push(
          requiredQuestion(
            "fechaNacimiento",
            "Fecha de nacimiento (paciente mayor de 18 años)",
          ),
        );
      }
      if (!isAdultAge(d.edad)) {
        missing.push(requiredQuestion("edad", "Edad válida (18 años o más)"));
      }
      if (
        isAdultBirthDate(d.fechaNacimiento) &&
        isAdultAge(d.edad) &&
        !isAgeConsistentWithBirthDate(d.fechaNacimiento, d.edad)
      ) {
        missing.push(
          requiredQuestion(
            "fechaNacimiento",
            "Fecha de nacimiento coherente con la edad indicada",
          ),
        );
      }
      if (isBlank(d.telefono)) {
        missing.push(requiredQuestion("telefono", "Teléfono"));
      }
      if (isBlank(d.ocupacion)) {
        missing.push(requiredQuestion("ocupacion", "Ocupación"));
      }
      if (isBlank(d.fechaConsulta)) {
        missing.push(requiredQuestion("fechaConsulta", "Fecha de consulta"));
      }
      if (isBlank(d.medicoTratante)) {
        missing.push(requiredQuestion("medicoTratante", "Médico tratante"));
      }
      return missing;
    }

    case "motivo-consulta": {
      const missing = [];
      if (isBlank(d.motivoPrincipal)) {
        missing.push(requiredQuestion("motivoPrincipal", "Motivo principal"));
      }
      if (d.motivoPrincipal === "Otro" && isBlank(d.motivoOtro)) {
        missing.push(requiredQuestion("motivoOtro", "Especifique el otro motivo"));
      }
      if (isBlank(d.dificultadPeso)) {
        missing.push(
          requiredQuestion(
            "dificultadPeso",
            "¿Desde cuándo presenta dificultad para controlar su peso?",
          ),
        );
      }
      if (isBlank(d.objetivoPaciente)) {
        missing.push(requiredQuestion("objetivoPaciente", "Objetivo del paciente"));
      }
      return missing;
    }

    case "historia-peso": {
      const missing = [];
      [
        ["pesoMaximo", "Peso máximo alcanzado (kg)"],
        ["pesoHabitual", "Peso habitual (kg)"],
        ["pesoActual", "Peso actual (kg)"],
        ["talla", "Talla (m)"],
        ["imc", "IMC (kg/m²)"],
        ["perimetroAbdominal", "Perímetro abdominal (cm)"],
      ].forEach(([field, label]) => {
        if (isInvalidDecimal(d[field])) {
          missing.push(requiredQuestion(field, label));
        }
      });
      if (isBlank(d.evolucionPeso)) {
        missing.push(
          requiredQuestion("evolucionPeso", "Evolución del peso / factores asociados"),
        );
      }
      if (isBlank(d.intentosPrevios)) {
        missing.push(requiredQuestion("intentosPrevios", "Intentos previos"));
      }
      if (d.intentosPrevios === "Otro" && isBlank(d.intentosOtros)) {
        missing.push(requiredQuestion("intentosOtros", "Especifique el otro intento"));
      }
      if (isBlank(d.tratamientosPreviosRespuesta)) {
        missing.push(
          requiredQuestion(
            "tratamientosPreviosRespuesta",
            "Tratamientos previos y respuesta obtenida",
          ),
        );
      }
      return missing;
    }

    case "antecedentes-personales": {
      const missing = [];
      if (isEmptySelection(d.enfermedadesAntecedentes)) {
        missing.push(
          requiredQuestion("enfermedadesAntecedentes", "Enfermedades / antecedentes"),
        );
      }
      if (
        Array.isArray(d.enfermedadesAntecedentes) &&
        d.enfermedadesAntecedentes.includes("Otros") &&
        isBlank(d.enfermedadesOtros)
      ) {
        missing.push(requiredQuestion("enfermedadesOtros", "Especifique otros antecedentes"));
      }
      if (isBlank(d.cirugiasPrevias)) {
        missing.push(requiredQuestion("cirugiasPrevias", "Cirugías previas"));
      }
      if (d.cirugiasPrevias === "Sí" && isBlank(d.cirugiaProcedimiento)) {
        missing.push(requiredQuestion("cirugiaProcedimiento", "Cirugía/procedimiento"));
      }
      if (d.cirugiasPrevias === "Sí" && isBlank(d.cirugiaFecha)) {
        missing.push(requiredQuestion("cirugiaFecha", "Fecha de la cirugía"));
      }
      if (isBlank(d.hospitalizacionesPrevias)) {
        missing.push(
          requiredQuestion("hospitalizacionesPrevias", "Hospitalizaciones previas"),
        );
      }
      if (d.hospitalizacionesPrevias === "Sí" && isBlank(d.hospitalizacionMotivo)) {
        missing.push(requiredQuestion("hospitalizacionMotivo", "Motivo de hospitalización"));
      }
      if (isBlank(d.alergiaMedicamentos)) {
        missing.push(requiredQuestion("alergiaMedicamentos", "Alergia a medicamentos"));
      }
      if (d.alergiaMedicamentos === "Sí" && isBlank(d.alergiaMedicamento)) {
        missing.push(requiredQuestion("alergiaMedicamento", "Medicamento que produce alergia"));
      }
      if (d.alergiaMedicamentos === "Sí" && isBlank(d.alergiaReaccion)) {
        missing.push(requiredQuestion("alergiaReaccion", "Reacción al medicamento"));
      }
      if (isBlank(d.alergiasAlimentarias)) {
        missing.push(requiredQuestion("alergiasAlimentarias", "Alergias alimentarias"));
      }
      if (d.alergiasAlimentarias === "Sí" && isBlank(d.alergiaAlimentariaCual)) {
        missing.push(requiredQuestion("alergiaAlimentariaCual", "¿Cuáles alergias alimentarias?"));
      }
      if (isBlank(d.alergiaLatex)) {
        missing.push(requiredQuestion("alergiaLatex", "Alergia a látex"));
      }
      if (isBlank(d.reaccionesAdversas)) {
        missing.push(
          requiredQuestion("reaccionesAdversas", "Reacciones adversas a medicamentos"),
        );
      }
      if (d.reaccionesAdversas === "Sí" && isBlank(d.reaccionAdversaMedicamento)) {
        missing.push(
          requiredQuestion(
            "reaccionAdversaMedicamento",
            "Medicamento/reacción adversa",
          ),
        );
      }
      if (isBlank(d.transfusionesSanguineas)) {
        missing.push(requiredQuestion("transfusionesSanguineas", "Transfusiones sanguíneas"));
      }
      return missing;
    }

    case "antecedentes-familiares": {
      const missing = [];
      if (isEmptySelection(d.antecedentesFamiliares)) {
        missing.push(requiredQuestion("antecedentesFamiliares", "Antecedentes familiares"));
      }
      if (
        Array.isArray(d.antecedentesFamiliares) &&
        d.antecedentesFamiliares.includes("Otros") &&
        isBlank(d.familiaresOtros)
      ) {
        missing.push(requiredQuestion("familiaresOtros", "Especifique otros antecedentes"));
      }
      if (isBlank(d.familiaresEspecificar)) {
        missing.push(
          requiredQuestion(
            "familiaresEspecificar",
            "Especificar antecedentes relevantes",
          ),
        );
      }
      return missing;
    }

    case "gineco-obstetricos": {
      const missing = [];
      [
        ["fum", "FUM"],
        ["g", "G"],
        ["p", "P"],
        ["c", "C"],
        ["a", "A"],
        ["metodoAnticonceptivo", "Método anticonceptivo"],
        ["embarazoActual", "Embarazo actual"],
        ["posibilidadEmbarazo", "Posibilidad de embarazo"],
        ["lactancia", "Lactancia"],
      ].forEach(([field, label]) => {
        if (isBlank(d[field])) missing.push(requiredQuestion(field, label));
      });
      return missing;
    }

    case "medicacion-actual": {
      const missing = [];
      if (isBlank(d.medicamentosActuales)) {
        missing.push(requiredQuestion("medicamentosActuales", "Medicamentos actuales"));
      }
      if (isBlank(d.suplementosVitaminas)) {
        missing.push(requiredQuestion("suplementosVitaminas", "Suplementos / vitaminas"));
      }
      if (isBlank(d.agonistasGlp1)) {
        missing.push(
          requiredQuestion(
            "agonistasGlp1",
            "¿Ha utilizado previamente agonistas GLP-1/GIP?",
          ),
        );
      }
      if (d.agonistasGlp1 === "Sí" && isBlank(d.agonistaMedicamento)) {
        missing.push(requiredQuestion("agonistaMedicamento", "Medicamento agonista GLP-1/GIP"));
      }
      if (d.agonistasGlp1 === "Sí" && isBlank(d.agonistaDosis)) {
        missing.push(requiredQuestion("agonistaDosis", "Dosis del agonista GLP-1/GIP"));
      }
      if (d.agonistasGlp1 === "Sí" && isBlank(d.agonistaRespuesta)) {
        missing.push(
          requiredQuestion(
            "agonistaRespuesta",
            "Respuesta/tolerancia del agonista GLP-1/GIP",
          ),
        );
      }
      return missing;
    }

    case "habitos-estilo": {
      const missing = [];
      [
        ["alimentacionHabitual", "Alimentación habitual"],
        ["comidasDia", "Número aproximado de comidas al día"],
        ["sensacionHambre", "Sensación de hambre habitual"],
        ["antojosPicoteo", "Antojos / picoteo frecuente"],
        ["actividadFisica", "Actividad física"],
        ["horasSueno", "Horas de sueño (horas/noche)"],
        ["calidadSueno", "Calidad del sueño"],
        ["consumoAlcohol", "Consumo de alcohol"],
      ].forEach(([field, label]) => {
        if (isBlank(d[field])) missing.push(requiredQuestion(field, label));
      });
      if (d.actividadFisica === "Regular" && isBlank(d.actividadFrecuencia)) {
        missing.push(
          requiredQuestion("actividadFrecuencia", "Frecuencia de actividad física"),
        );
      }
      return missing;
    }

    case "sintomas-actuales":
      return isEmptySelection(d.sintomasActuales)
        ? [requiredQuestion("sintomasActuales", "Síntomas presentes")]
        : [];

    case "evaluacion-seguridad": {
      const labels = {
        carcinomaMedularPersonal: "Carcinoma medular de tiroides personal",
        carcinomaMedularFamiliar: "Carcinoma medular de tiroides familiar",
        men2PersonalFamiliar: "MEN 2 personal/familiar",
        enfermedadTiroideaConocida: "Enfermedad tiroidea conocida",
        pancreatitisPrevia: "Pancreatitis previa",
        dolorAbdominalRecurrente: "Dolor abdominal intenso/recurrente",
        litiasisVesicular: "Litiasis vesicular",
        colecistitis: "Colecistitis",
        cirugiaVesicula: "Cirugía de vesícula",
        enfermedadHepatica: "Enfermedad hepática",
        ictericiaPrevia: "Ictericia previa",
        gastroparesia: "Gastroparesia diagnosticada",
        enfermedadGiImportante: "Enfermedad GI importante",
        enfermedadRenal: "Enfermedad renal",
        deshidratacionReciente: "Deshidratación reciente",
        hipoglucemiasPrevias: "Hipoglucemias previas",
        insulina: "Insulina",
        sulfonilureas: "Sulfonilureas",
        otrosMedDiabetes: "Otros medicamentos para diabetes",
        otrosMedPeso: "Otros medicamentos para pérdida de peso",
      };

      return Object.entries(labels)
        .filter(([field]) => isBlank(d[field]))
        .map(([field, label]) => requiredQuestion(field, label));
    }

    case "evaluacion-clinica": {
      const missing = [];
      [
        ["presionSistolica", "Presión sistólica"],
        ["presionDiastolica", "Presión diastólica"],
        ["frecuenciaCardiaca", "Frecuencia cardíaca (lpm)"],
        ["pesoClinico", "Peso (kg)"],
        ["tallaClinica", "Talla (m)"],
        ["imcClinico", "IMC (kg/m²)"],
        ["perimetroAbdominalClinico", "Perímetro abdominal (cm)"],
      ].forEach(([field, label]) => {
        if (isInvalidDecimal(d[field])) {
          missing.push(requiredQuestion(field, label));
        }
      });
      if (isBlank(d.examenFisico)) {
        missing.push(requiredQuestion("examenFisico", "Examen físico relevante"));
      }
      return missing;
    }

    case "examenes-auxiliares": {
      const missing = [];
      if (isBlank(d.fechaLaboratorio)) {
        missing.push(requiredQuestion("fechaLaboratorio", "Fecha de laboratorio"));
      }
      [
        ["glucosaAyunas", "Glucosa en ayunas"],
        ["hba1c", "HbA1c"],
        ["creatinina", "Creatinina"],
        ["tfge", "TFGe / eGFR"],
        ["tgoAst", "TGO / AST"],
        ["tgpAlt", "TGP / ALT"],
        ["colesterolTotal", "Colesterol total"],
        ["ldl", "LDL"],
        ["hdl", "HDL"],
        ["trigliceridos", "Triglicéridos"],
        ["tsh", "TSH"],
      ].forEach(([field, label]) => {
        if (isBlank(d[field])) missing.push(requiredQuestion(field, label));
      });
      return missing;
    }

    case "evaluacion-medica": {
      const missing = [];
      if (!normalizeDiagnosisValues(d).some((diagnostico) => diagnostico.trim().length > 0)) {
        missing.push(
          requiredQuestion("diagnosticos", "Diagnóstico / impresión diagnóstica"),
        );
      }
      [
        ["comorbilidades", "Comorbilidades asociadas"],
        ["factoresRiesgo", "Factores de riesgo identificados"],
        ["observacionesClinicas", "Observaciones clínicas"],
      ].forEach(([field, label]) => {
        if (isBlank(d[field])) missing.push(requiredQuestion(field, label));
      });
      return missing;
    }

    case "conducta-plan": {
      const missing = [];
      if (isEmptySelection(d.conductaPlan)) {
        missing.push(requiredQuestion("conductaPlan", "Conducta"));
      }
      if (
        Array.isArray(d.conductaPlan) &&
        d.conductaPlan.includes("Otros") &&
        isBlank(d.conductaOtro)
      ) {
        missing.push(requiredQuestion("conductaOtro", "Especifique la otra conducta"));
      }
      [
        ["medicamentoIndicado", "Medicamento indicado"],
        ["presentacion", "Presentación"],
        ["dosisInicial", "Dosis inicial"],
        ["fechaInicioTratamiento", "Fecha prevista de inicio"],
        ["proximoControl", "Próximo control"],
      ].forEach(([field, label]) => {
        if (isBlank(d[field])) missing.push(requiredQuestion(field, label));
      });
      return missing;
    }

    case "constancia-medica": {
      const missing = [];
      if (isBlank(d.consentimientoInformado)) {
        missing.push(
          requiredQuestion(
            "consentimientoInformado",
            "Consentimiento informado específico",
          ),
        );
      }
      if (isBlank(d.consentimientoFecha)) {
        missing.push(requiredQuestion("consentimientoFecha", "Fecha de consentimiento"));
      }
      if (isBlank(d.fechaConstancia)) {
        missing.push(requiredQuestion("fechaConstancia", "Fecha de constancia"));
      }
      return missing;
    }

    default:
      return [];
  }
}

/** Array of validators indexed by step */
export const STEP_VALIDATORS = [
  validateDatosIdentificacion,
  validateMotivoConsulta,
  validateHistoriaPeso,
  validateAntecedentesPersonales,
  validateAntecedentesFamiliares,
  validateGinecoObstetricos,
  validateMedicacionActual,
  validateHabitosEstilo,
  validateSintomasActuales,
  validateEvaluacionSeguridad,
  validateEvaluacionClinica,
  validateExamenesAuxiliares,
  validateEvaluacionMedica,
  validateConductaPlan,
  validateConstanciaMedica,
];
